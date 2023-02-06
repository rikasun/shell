import os
import os.path
import shutil
import six
import tempfile
import time
import paramiko
from paramiko import AutoAddPolicy, SSHClient

import unittest

from shell.models import (
    CertificateAuthority,
)
from shell.cloudyblobject import (
    CloudyBlobject,
)

# https://github.com/paramiko/paramiko/blob/93dba53fba7da34f34660ac4f5fba4cae317a6ed/paramiko/pkey.py#L47-L59
def my_unpad_openssh(data):
    # At the moment, this is only used for unpadding private keys on disk. This
    # really ought to be made constant time (possibly by upstreaming this logic
    # into pyca/cryptography).
    padding_length = six.indexbytes(data, -1)
    if 0x20 <= padding_length < 0x7F:
        return data  # no padding, last byte part comment (printable ascii)
    if padding_length == 0:
        return data  # no padding and no comment apparently, fixes 'invalid key curve identifier' on keys generated with step
    if padding_length > 15:
        raise paramiko.SSHException("Invalid key")
    for i in range(padding_length):
        if six.indexbytes(data, i - padding_length) != i + 1:
            raise paramiko.SSHException("Invalid key")
    return data[:-padding_length]


paramiko.pkey._unpad_openssh = my_unpad_openssh


def add_cert_to_sshd(sshd_upd_dir, principals, ca):
    """Generate CA's certificate and update sshd configuration."""
    ca_id = ca.id()

    with open(os.path.join(sshd_upd_dir, f"cased_{ca_id}.pub"), "w") as pub_ca_key:
        pub_ca_key.write(ca.public_key_data())

    with open(os.path.join(sshd_upd_dir, "cased_org_principal"), "w") as principal_fp:
        principal_fp.write(principals[0])

    # Create a manifest.txt file with instructions for updating the sshd config.
    tmp_mf = os.path.join(sshd_upd_dir, "manifest.tmp")
    with open(tmp_mf, "w") as mf:
        mf.write("[options]\n")
        mf.write(f"TrustedUserCAKeys /etc/ssh/cased_{ca_id}.pub\n")
        mf.write("AuthorizedPrincipalsFile /etc/ssh/cased_org_principal\n")
        mf.write("[files]\n")
        mf.write(f"cased_{ca_id}.pub\n")
        mf.write("cased_org_principal\n")

    # Ensure sshd_updater.sh read the whole manifest.txt file at once
    # by renaming a temporary file instead of writting directly to it.
    os.rename(tmp_mf, os.path.join(sshd_upd_dir, "manifest.txt"))


def gen_ssh_key(ca, principals):
    """Generate a new ssh client key signed by CA's certificate"""

    cert_data, key_data = ca.generate_keypair(principals)

    with tempfile.TemporaryDirectory() as temp_dir:
        # This path name is important to paramiko's cert loading functionality
        cert_path = "{}/key-cert.pub".format(temp_dir)
        with open(cert_path, "w") as cf:
            cf.write(cert_data)

        key_path = "{}/key".format(temp_dir)
        with open(key_path, "w") as kf:
            kf.write(key_data)

        ecdsakey = paramiko.ECDSAKey.from_private_key_file(key_path, None)
        ecdsakey.load_certificate(cert_path)
        return ecdsakey


class TestCertificateAuthority(unittest.TestCase):
    def test_certificate_authority(self):
        # Currently this script is used only for integration tests.
        if os.getenv("SUITE") is None:
            assert True
            return

        # Ensure we start the CA test with a clean environment.
        CloudyBlobject._storage_driver.delete_all()
        # shutil.rmtree("/code/.storage/", ignore_errors=True)

        certificate_authority = CertificateAuthority.primary()
        principals = ["cased-shell"]
        ssh_update_dir = "/sshd_update"

        # Update sshd configuration.
        add_cert_to_sshd(ssh_update_dir, principals, certificate_authority)

        # Allow enough time for sshd to restart.
        time.sleep(3)

        pkey = gen_ssh_key(certificate_authority, principals)

        client = SSHClient()
        client.load_system_host_keys()
        client.set_missing_host_key_policy(AutoAddPolicy())

        print("Connecting to SSH server...")

        client.connect(
            "sshserver",
            username="root",
            pkey=pkey,
            timeout=5000,
        )

        _, stdout, _ = client.exec_command("id -un")

        assert stdout.read().decode("utf-8").strip() == "root"

    def tearDown(self):
        CloudyBlobject._storage_driver.delete_all()
        CertificateAuthority.cache = None
        super().tearDown()
