import os
import shutil
from tests.models.test_base import TestBase
from shell.models import (
    CertificateAuthority,
)
from shell.cloudyblobject import (
    CloudyBlobject,
)


class TestCertificateAuthority(TestBase):
    def setUp(self):
        super().setUp()
        CloudyBlobject._storage_driver.delete_all()

    def test_singleton(self):
        self.assertEqual(len(CertificateAuthority.list()), 0)
        self.assertEqual(CertificateAuthority.primary().name, "primary")
        self.assertEqual(len(CertificateAuthority.list()), 1)
        ca_dir = os.getenv("CA_DIR", os.path.join(os.getcwd(), ".storage", "ca"))
        try:
            shutil.rmtree(ca_dir)
        except Exception:
            pass
        self.assertEqual(CertificateAuthority.primary().name, "primary")
        self.assertEqual(len(CertificateAuthority.list()), 1)

    def test_principals(self):
        principals = CertificateAuthority.primary().principals("user@example.com")
        self.assertIn("user@example.com", principals)
        self.assertEqual(len(principals), 3)

    def test_generation(self):
        ca = CertificateAuthority.primary()
        principals = ca.principals("user@example.com")
        cert_data, key_data = ca.generate_keypair(principals)
        self.assertIsNotNone(cert_data)
        self.assertIsNotNone(key_data)
        self.assertIn("ecdsa-sha2-nistp256-cert-v01@openssh.com", cert_data)
        self.assertIn("BEGIN OPENSSH PRIVATE KEY", key_data)

    def tearDown(self):
        CloudyBlobject._storage_driver.delete_all()
        CertificateAuthority.cache = None
        super().tearDown()
