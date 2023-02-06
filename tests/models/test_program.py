from tests.models.test_base import TestBase
from shell.models import (
    Organization,
    User,
    Program,
    Approval,
    ApprovalSettings,
    approval,
)


class TestProgram(TestBase):
    def test_belongs_to_creator_and_organization(self):
        organization = Organization.create(
            name="New Organization", logo_image_url="http://"
        )
        user = User.create(
            name="New User", email="user@user.com", organization=organization
        )
        program = Program.create(name="program", path="rails", creator_id=user.id)
        self.assertEqual(program.creator, user)
        self.assertEqual(program.organization, organization)

    def test_has_many_approvals(self):
        program = Program.create(name="program", path="rails")
        self.assertEqual(program.approvals, [])
        approval = Approval.create(program=program)
        self.assertEqual(program.approvals, [approval])

    def test_has_one_approval_settings(self):
        program = Program.create(name="program", path="rails")
        self.assertEqual(program.approval_settings, None)
        approval_settings = ApprovalSettings.create(program_id=program.id)
        self.session.refresh(program)
        self.assertEqual(program.approval_settings, approval_settings)

    def test_dependent_destroy(self):
        program = Program.create(name="program", path="rails")
        approval_settings = ApprovalSettings.create(program_id=program.id)
        self.session.refresh(program)
        self.assertEqual(ApprovalSettings.all(), [approval_settings])
        program.delete()
        self.assertEqual(ApprovalSettings.all(), [])
