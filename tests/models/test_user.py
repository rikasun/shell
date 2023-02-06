import pytest
from tests.models.test_base import TestBase
from shell.models import Organization, Group, User, UserGroup, Program


class TestUser(TestBase):
    def test_role_defaults_to_user(self):
        organization = Organization.create(
            name="New Organization", logo_image_url="http://"
        )
        new_user_1 = User.create(
            name="New User 1",
            email="user_1@user.com",
            admin=None,
            organization=organization,
        )
        new_user_2 = User.create(
            name="New User 2", email="user_2@user.com", organization=organization
        )
        self.assertEqual(new_user_1.admin, False)
        self.assertEqual(new_user_2.admin, False)

    def test_has_group_through_user_group(self):
        organization = Organization.create(
            name="New Organization", logo_image_url="http://"
        )
        user = User.create(
            name="New User", email="user@user.com", organization=organization
        )
        group = Group.create(name="new group", organization=organization)
        UserGroup.create(group_user=user, user_group=group)
        self.assertEqual(user.groups, [group])

    def test_user_can_create_many_programs(self):
        organization = Organization.create(
            name="New Organization", logo_image_url="http://"
        )
        user1 = User.create(
            name="New User", email="user@user.com", organization=organization
        )
        program1 = Program.create(name="program", path="rails", creator=user1)
        program2 = Program.create(name="program2", path="rails2", creator=user1)
        self.assertEqual(user1.programs_created, [program1, program2])

    def test_find(self):
        self.assertEqual(User.all(), [])
        new_user = User.create(name="New User", email="user@user.com")
        self.assertEqual(new_user.id, User.find(1).id)

    def test_update(self):
        organization = Organization.create(
            name="New Organization", logo_image_url="http://"
        )
        new_user_1 = User.create(
            name="New User 1",
            email="user_1@user.com",
            admin=False,
            organization=organization,
        )
        self.assertEqual(new_user_1.admin, False)
        new_user_1.update(admin=True)
        self.assertEqual(new_user_1.admin, True)

    def test_ensure_last_admin(self):
        organization = Organization.create(
            name="New Organization", logo_image_url="http://"
        )
        new_user_1 = User.create(
            name="New User 1",
            email="user_1@user.com",
            admin=True,
            organization=organization,
        )
        self.assertEqual(new_user_1.admin, True)
        with pytest.raises(ValueError):
            new_user_1.update(admin=False)

    access_token = {
        "iss": "https://jnewland-musical-potato-r4v5xpcxw79-8889.preview.app.github.dev/idp",
        "sub": "CgI0NxIGZ2l0aHVi",
        "aud": "cased-cli",
        "exp": 1674231793,
        "iat": 1674145393,
        "at_hash": "KiKqBhYinlRK2gQ9t_jWHw",
        "email": "jesse@jnewland.com",
        "email_verified": True,
        "name": "Jesse Newland",
        "preferred_username": "jnewland",
    }
    id_token = {
        "iss": "https://jnewland-musical-potato-r4v5xpcxw79-8889.preview.app.github.dev/idp",
        "sub": "CgI0NxIGZ2l0aHVi",
        "aud": "cased-shell",
        "exp": 1674232008,
        "iat": 1674145608,
        "at_hash": "W24NAMUmEFN7wCNwtsvuFA",
        "c_hash": "FwEzqQZizYONHU4_cx9Eyw",
        "email": "jesse@jnewland.com",
        "email_verified": True,
        "groups": ["example"],
        "name": "Jesse Newland",
        "preferred_username": "jnewland",
        "federated_claims": {"connector_id": "github", "user_id": "47"},
    }

    def test_find_user_from_access_token(self):
        organization = Organization.create(
            name="New Organization", logo_image_url="http://"
        )
        new_user_1 = User.create(
            name="Jesse Newland",
            email="jesse@jnewland.com",
            admin=True,
            organization=organization,
            idp_user_id="CgI0NxIGZ2l0aHVi",
        )

        self.assertIsNone(User.find_by_validated_access_token(dict(sub="1234")))

        find_new_user = User.find_by_validated_access_token(self.access_token)
        self.assertEqual(find_new_user.id, new_user_1.id)
        self.assertEqual(find_new_user.role, "admin")

        with pytest.raises(ValueError):
            User.find_by_validated_access_token(self.id_token)

    def test_find_create_or_update_from_id_token(self):
        organization = Organization.create(
            name="New Organization", logo_image_url="http://"
        )
        self.assertIsNone(User.find_by_validated_access_token(self.access_token))
        user = User.find_create_or_update_from_id_token(self.id_token)
        self.assertEqual(
            user.id, User.find_by_validated_access_token(self.access_token).id
        )
        self.assertEqual(user.idp_user_id, self.id_token["sub"])
        self.assertEqual(user.organization.id, organization.id)

        count = len(User.all())
        user = User.find_create_or_update_from_id_token(self.id_token)
        self.assertEqual(len(User.all()), count)

        count = len(User.all())
        new_user_token = self.id_token.copy()
        new_user_token["sub"] = "1234"
        new_user_token["email"] = "whatever@example.com"
        user = User.find_create_or_update_from_id_token(new_user_token)
        self.assertEqual(len(User.all()), count + 1)

        count = len(User.all())
        new_connector_same_email_token = self.id_token.copy()
        new_connector_same_email_token["sub"] = "1234"
        user = User.find_create_or_update_from_id_token(new_connector_same_email_token)
        self.assertEqual(len(User.all()), count)
        self.assertEqual(
            User.find_by_validated_access_token(self.access_token).idp_user_id,
            new_connector_same_email_token["sub"],
        )

    def test_crud_user_groups_from_id_token(self):
        Organization.create(name="New Organization", logo_image_url="http://")
        user = User.find_create_or_update_from_id_token(self.id_token)
        self.assertEqual(
            [f"{g.user_group.name}" for g in user.user_group.all()],
            ["github example", "github"],
        )

        # Ensure the same groups and memberships are not duplicated
        group_count = len(UserGroup.all())
        ug_count = len(UserGroup.all())
        user = User.find_create_or_update_from_id_token(self.id_token)
        self.assertEqual(len(Group.all()), group_count)
        self.assertEqual(len(UserGroup.all()), ug_count)

        # Ensure membership is removed when groups from the same connector are no longer in the id_token
        new_id_token = self.id_token.copy()
        new_id_token["groups"] = []
        user2 = User.find_create_or_update_from_id_token(new_id_token)
        self.assertEqual(
            [f"{g.user_group.name}" for g in user2.user_group.all()], ["github"]
        )
