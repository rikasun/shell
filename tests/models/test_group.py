from tests.models.test_base import TestBase
from shell.models import User, UserGroup, Organization, Group


class TestGroup(TestBase):
    def test_has_users_through_group_user(self):
        organization = Organization.create(
            name="New Organization", logo_image_url="http://"
        )
        user = User.create(
            name="New User", email="user@user.com", organization=organization
        )
        group = Group.create(name="new group", organization=organization)
        UserGroup.create(group_user=user, user_group=group)
        self.assertEqual(group.users, [user])

    def test_find(self):
        organization = Organization.create(
            name="New Organization", logo_image_url="http://"
        )
        self.assertEqual(Group.first(), None)
        new_group = Group.create(name="Group", organization=organization)
        self.assertEqual(new_group.id, Group.first().id)
