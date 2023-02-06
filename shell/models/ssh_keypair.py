import itertools
import os
import shutil
import subprocess
import tempfile
import datetime
import uuid


class SSHKeypair:
    def __init__(self, ca):
        self.ca = ca

    def generate(self, principals):
        """Generate a new certificate and private key.
        Return a two elements tuple (cert, key).
        """
        step = shutil.which("step")
        if step is None:
            raise RuntimeError("Unable to find step client")

        principal_args = [("--principal", f"{principal}") for principal in principals]
        keypair_id = str(uuid.uuid4())

        with tempfile.TemporaryDirectory() as tmpdir:
            key_file = os.path.join(tmpdir, keypair_id)
            cert_file = os.path.join(tmpdir, "{}-cert.pub".format(keypair_id))

            with self.ca.ca_password_in_config():
                subprocess.check_call(
                    [
                        step,
                        "ssh",
                        "certificate",
                        "--offline",
                        "--ca-config",
                        self.ca.ca_config_file(),
                        "--provisioner",
                        "admin",
                        *itertools.chain(*principal_args),
                        "--insecure",
                        "--no-password",
                        "--provisioner-password-file",
                        self.ca.ca_password_file(),
                        "--not-before",
                        (
                            datetime.datetime.now(datetime.timezone.utc)
                            - datetime.timedelta(hours=1)
                        ).isoformat(),
                        "--not-after",
                        (
                            datetime.datetime.now(datetime.timezone.utc)
                            + datetime.timedelta(hours=12)
                        ).isoformat(),
                        "--force",
                        keypair_id,
                        key_file,
                    ],
                    cwd=tmpdir,
                    env={
                        "STEPPATH": self.ca.ca_dir(),
                        "STEPDEBUG": "1",
                    },
                )

                with open(cert_file, "r") as cf:
                    cert_data = cf.read().strip()

                with open(key_file, "r") as kf:
                    key_data = kf.read().strip()

                return cert_data, key_data
