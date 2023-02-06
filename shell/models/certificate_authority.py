from collections import namedtuple
import json
from typing import List
from shell.cloudyblobject import (
    CloudyBlobject,
    IDIndexedCloudyBlobject,
)
from base64 import b64decode, b64encode
from contextlib import contextmanager
import logging
import os
import subprocess
import secrets
import shutil
import string

from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

from shell.models.ssh_keypair import SSHKeypair
from shell.models import Organization, CasedShell
from shell.utils import to_slug

PRIMARY_CA_NAME = "primary"


class CAStorage(CloudyBlobject):
    """Stores CA files into external storage"""

    def upload(self, rootdir, objname):
        logging.info(f"About to compress CA files: rootdir={rootdir}, obj={objname}")
        archive_name = shutil.make_archive(objname, "zip", root_dir=rootdir)
        logging.info(f"Generated archive: {archive_name}")

        logging.info("Uploading to extenal storage...")
        with open(archive_name, "rb") as archive:
            data = archive.read()
            self._storage_driver.write(archive_name, data, encoder=None)

        logging.info("Upload is complete")
        return archive_name

    @contextmanager
    def download_and_extract(self, objname, rootdir):
        if os.getenv("STORAGE_BACKEND", "local") == "local":
            # Nothing do, using local storage.
            yield
            return

        logging.info(f"About to download CA archive: obj={objname}, rootdir={rootdir}")
        archive_data = self._storage_driver.read(objname, encoder=None)

        with open(objname, "wb") as archive:
            archive.write(archive_data)

        shutil.unpack_archive(objname, rootdir, format="zip")
        logging.info("Archive sucessfully extracted")
        yield

        # Remove temporary CA zip file.
        os.remove(objname)

        # Remove CA directory tree from local filesystem.
        shutil.rmtree(rootdir)


class CertificateAuthority(IDIndexedCloudyBlobject):
    primary_key = "name"

    @classmethod
    def primary(cls):
        found = cls.find(PRIMARY_CA_NAME)
        if found is None:
            cls(name=PRIMARY_CA_NAME).save()
            found = cls.find(PRIMARY_CA_NAME)

        return found

    def base_dir(self):
        ca_dir = os.getenv("CA_DIR", os.path.join(os.getcwd(), ".storage", "ca"))
        os.makedirs(ca_dir, exist_ok=True)
        return ca_dir

    def ca_dir(self):
        return os.path.join(self.base_dir(), self.name)

    def compressed_ca_file(self):
        return os.path.join(self.base_dir(), "%s.tgz" % self.name)

    def public_key_file(self):
        return os.path.join(self.ca_dir(), "certs", "ssh_user_ca_key.pub")

    def public_key_data(self):
        with CAStorage().download_and_extract(self.ca_archive, self.base_dir()):
            with open(self.public_key_file(), "r") as r:
                return r.read()

    def id(self):
        return self._id

    def root_ca_crt_file(self):
        return os.path.join(self.ca_dir(), "certs", "root_ca.crt")

    def ca_password_file(self):
        return os.path.join(self.ca_dir(), "password")

    def ca_config_file(self):
        return os.path.join(self.ca_dir(), "config", "ca.json")

    def old_ca_config_file(self):
        return os.path.join(self.ca_dir(), "config", "ca.json.old")

    def init_ca(self):
        step = shutil.which("step")
        if step is None:
            raise RuntimeError("Unable to find step client")

        try:
            os.makedirs(self.ca_dir())
        except OSError as e:
            logging.error("Failed to create CA directory: {}".format(e))
            return

        # Generate a random ID to be used by this CA
        self._id = self._gen_random_password(length=27, with_punctuation=False)
        # Generate a new password to use for the CA operations.
        self._gen_ca_password()

        # Initialize the CA.
        p = subprocess.run(
            [
                step,
                "ca",
                "init",
                "--ssh",
                "--name",
                PRIMARY_CA_NAME + str(id(self)),
                "--provisioner",
                "admin",
                "--dns",
                "localhost",
                "--address",
                ":443",
                "--password-file",
                self.ca_password_file(),
                "--provisioner-password-file",
                self.ca_password_file(),
                "--no-db",
            ],
            env={
                "STEPPATH": self.ca_dir(),
                "STEPDEBUG": "1",
            },
            capture_output=True,
        )

        self.ca_archive = None
        if p.returncode == 0:
            # Check if need to upload CA files to external storage.
            if os.getenv("STORAGE_BACKEND", "local") != "local":
                storage = CAStorage()
                try:
                    self.ca_archive = storage.upload(
                        self.base_dir(), f"ca_{PRIMARY_CA_NAME}"
                    )
                except:
                    # We failed to upload CA data, remove the dangling
                    # CertificateAuthority.json file.
                    self.delete()
                    raise
                finally:
                    # The CA directory on local storage is always cleared
                    # if STORAGE_BACKEND != local
                    shutil.rmtree(self.base_dir())
        else:
            # `step ca init` failed, remove CertificateAuthority.json file.
            self.delete()
            raise RuntimeError(f"{p.returncode}: {p.stderr.decode()}")

    def save(self):
        self.init_ca()
        return super().save()

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def generate_keypair(self, principals):
        with CAStorage().download_and_extract(self.ca_archive, self.base_dir()):
            return SSHKeypair(self).generate(principals)

    @staticmethod
    def _gen_random_password(length, with_digits=True, with_punctuation=True):
        """Generate a random, secure string.
        With default settings the resulting string will contain at least two
        uppercase and two lowercase letters, two punctuation symbols and two digits.
        """
        assert length >= 8, "length must be at least 8"

        alphabet = string.ascii_letters
        if with_digits:
            alphabet += string.digits
        if with_punctuation:
            alphabet += string.punctuation

        while True:
            password = "".join(secrets.choice(alphabet) for i in range(length))
            valid = (
                sum(c.islower() for c in password) >= 2
                and sum(c.isupper() for c in password) >= 2
            )
            if valid and with_digits:
                valid = sum(c.isdigit() for c in password) >= 2
            if valid and with_punctuation:
                valid = sum(c in string.punctuation for c in password) >= 2
            if valid:
                return password

    def _gen_ca_password(self):
        # Generate a random AES key and password, 256 bits length.
        key = get_random_bytes(32)
        password = CertificateAuthority._gen_random_password(32)
        cipher = AES.new(key, AES.MODE_EAX)

        # Store the encrypted password, tag and nonce in the instance.
        # These will be used at any time we need to generate the temporary
        # CA password file for signing certificates.
        self.encrypted_password, self.tag = cipher.encrypt_and_digest(
            password.encode("utf-8")
        )
        self.nonce = cipher.nonce

        # Base64 encode data and convert it to str to be able to serialize the instance.
        self.key = b64encode(key).decode("utf-8")
        self.encrypted_password = b64encode(self.encrypted_password).decode("utf-8")
        self.tag = b64encode(self.tag).decode("utf-8")
        self.nonce = b64encode(self.nonce).decode("utf-8")

        # Write the password to the CA password file.
        with open(self.ca_password_file(), "w") as w:
            w.write(password)

    @staticmethod
    def principals(user: str) -> List[str]:
        """Generate principals for ssh-certificate access"""
        org = Organization.first() or namedtuple("O", ["name", "id"])("Cased2022", 1)
        org_name = to_slug(org.name)
        hostname = os.getenv("CASED_SHELL_HOSTNAME", "unknown")

        shell = CasedShell.first() or namedtuple("S", ["name", "id"])(
            "CasedShell2022", 1
        )
        shell_name = to_slug(shell.name)
        return [
            user,
            f"noreply+{org_name}_{org.id}@{hostname}",
            f"noreply+{shell_name}_{shell.id}@{hostname}",
        ]

    @contextmanager
    def ca_password_in_config(self):
        """
        Context manager to temporarily set the CA password in the config file.
        """
        shutil.copyfile(self.ca_config_file(), self.old_ca_config_file())

        with open(self.ca_config_file(), "r") as r:
            config = json.load(r)

        decryptor = AES.new(b64decode(self.key), AES.MODE_EAX, b64decode(self.nonce))
        password = decryptor.decrypt_and_verify(
            b64decode(self.encrypted_password), b64decode(self.tag)
        )

        config["password"] = password.decode("utf-8")

        with open(self.ca_config_file(), "w") as w:
            json.dump(config, w)

        yield

        shutil.copyfile(self.old_ca_config_file(), self.ca_config_file())
