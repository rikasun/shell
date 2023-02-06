from tests.models.test_base import TestBase
from shell.models import Organization


class TestOrganization(TestBase):
    def test_find(self):
        self.assertEqual(Organization.first(), None)
        new_organization = Organization.create(
            name="New Organization", logo_image_url="http://"
        )
        self.assertEqual(new_organization.id, Organization.first().id)

    def test_find_by(self):
        self.assertEqual(Organization.first(), None)
        new_organization = Organization.create(
            name="New Organization", logo_image_url="http://"
        )
        self.assertEqual(
            new_organization, Organization().find_by(name="New Organization")[0]
        )
        self.assertEqual([], Organization().find_by(name="New Organization 2"))
