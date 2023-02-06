from tests.test_app_v2 import TestV2AppBaseWithSeeds
from shell.models import User, Program, LogEntry


class TestLogEntry(TestV2AppBaseWithSeeds):
    def test_belongs_to(self):
        user = User.find(1)
        program = Program.find(1)
        log_entry = LogEntry.create(creator_id=user.id, program_id=program.id)
        self.assertEqual(log_entry.creator, user)
        self.assertEqual(log_entry.program, program)
        self.assertEqual(log_entry.runbook, None)
        self.assertEqual(log_entry.prompt, None)
        self.assertEqual(log_entry.organization, user.organization)
