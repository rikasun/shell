from tests.models.test_base import TestBase
import pytest
from transitions import MachineError
from shell.models import Organization, User, Program, Approval


class TestApproval(TestBase):
    def test_has_one_requestor(self):
        organization = Organization.create(
            name="New Organization", logo_image_url="http://"
        )
        user = User.create(
            name="New User", email="user@user.com", organization=organization
        )
        program = Program.create(name="program", path="rails")
        approval = Approval.create(requestor_id=user.id, program_id=program.id)
        self.assertEqual(approval.requestor, user)

    def test_specify_col_name_from_db(self):
        approval = Approval.create()
        self.assertEqual(approval.metadata_, {})
        approval.metadata_ = {"foo", "bar"}
        self.assertEqual(approval.metadata_, {"foo", "bar"})

    def test_approval_belongs_to_program_optionally(self):
        program = Program.create(name="program", path="rails")
        approval_1 = Approval.create()
        approval_2 = Approval.create(program_id=program.id)
        self.assertEqual(approval_1.program, None)
        self.assertEqual(approval_2.program, program)

    def test_initial_approval_state(self):
        approval = Approval.create()
        self.assertEqual(approval.state, "requested")
        self.assertEqual(approval.status, "requested")

    def test_cannot_transit_unlisted_state(self):
        approval = Approval.create(status="approved")
        with pytest.raises(MachineError):
            assert not approval.deny()

    def test_approve_approval(self):
        approval = Approval.create()
        approval.approve()
        self.assertEqual(approval.state, "approved")
        self.assertEqual(approval.status, "approved")

    def test_deny_approval(self):
        approval = Approval.create()
        approval.deny()
        self.assertEqual(approval.state, "denied")
        self.assertEqual(approval.status, "denied")

    def test_cancel_approval(self):
        approval = Approval.create()
        approval.cancel()
        self.assertEqual(approval.state, "cancelled")
        self.assertEqual(approval.status, "cancelled")

    def test_timeout_approval(self):
        approval = Approval.create()
        approval.timeout()
        self.assertEqual(approval.state, "timed out")
        self.assertEqual(approval.status, "timed out")
