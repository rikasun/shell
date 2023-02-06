from tests.models.test_base import TestBase
from shell.models import Organization, Snippet


class TestSnippet(TestBase):
    def test_belongs_to_organization(self):
        organization = Organization.first() or Organization.create(
            name="New Organization", logo_image_url="http://"
        )
        snippet = Snippet.create(
            name="first snippet", code="users", organization=organization
        )
        self.assertEqual(snippet.organization, organization)
        self.assertEqual(organization.snippets, [snippet])
