import unittest
from tests.models.test_base import TestBase
from shell.models import Organization, Group, User, UserGroup, Program, CasedShell


class TestCasedShell(TestBase):
    def test_can_create_a_casedshell(self):
        organization = Organization.create(
            name="New Organization", logo_image_url="http://"
        )
        casedshell = CasedShell.create(
            organization=organization, name="test-shell", hostname="example.com"
        )

        self.assertEqual(casedshell.name, "test-shell")

    def test_casedshell_default_to_ca_enabled(self):
        organization = Organization.create(
            name="New Organization", logo_image_url="http://"
        )
        casedshell = CasedShell.create(
            organization=organization, name="test-shell", hostname="example.com"
        )

        self.assertTrue(casedshell.ca_enabled)

    def test_casedshell_is_associated_with_an_org(self):
        organization = Organization.create(
            name="New Organization", logo_image_url="http://"
        )
        casedshell = CasedShell.create(
            organization=organization, name="test-shell", hostname="example.com"
        )

        self.assertEqual(casedshell.organization, organization)


if __name__ == "__main__":
    unittest.main()
