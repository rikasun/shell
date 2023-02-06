import unittest
import shutil
from shell.models import (
    ShellSession,
)
from shell.cloudyblobject import (
    CloudyBlobject,
)


class TestShellSession(unittest.TestCase):
    def test_round_trip(self):
        j = ShellSession.create(session_id="1234", creator="Jesse", ip="1.2.3.4")
        j2 = ShellSession.find("1234")
        self.assertEqual(j2.ip, "1.2.3.4")
        self.assertEqual(ShellSession.active_sessions().pop().ip, "1.2.3.4")
        j.end_session()
        self.assertEqual(len(ShellSession.list()), 1)
        self.assertEqual(len(ShellSession.active_sessions()), 0)

    def tearDown(self):
        CloudyBlobject._storage_driver.delete_all()
        ShellSession.cache = None
        super().tearDown()
