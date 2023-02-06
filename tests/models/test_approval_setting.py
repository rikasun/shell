from tests.models.test_base import TestBase
from shell.models import Organization, User, Program, ApprovalSettings


class TestApprovalSettings(TestBase):
    def test_belongs_to_program_or_prompt(self):
        organization = Organization.create(
            name="New Organization", logo_image_url="http://"
        )
        user = User.create(
            name="New User", email="user@user.com", organization=organization
        )
        program = Program.create(name="program", path="rails", creator_id=user.id)
        approval_settings = ApprovalSettings.create(program_id=program.id)
        self.assertEqual(program.approval_settings, approval_settings)
        self.assertEqual(approval_settings.program, program)

    def test_approval_duration_defaults_to_zero(self):
        approval_settings = ApprovalSettings.create()
        self.assertEqual(approval_settings.approval_duration, 0)

    def test_subcommands_defaults_to_empty(self):
        approval_settings = ApprovalSettings.create()
        self.assertEqual(approval_settings.subcommands, [])
