import unittest
from shell.models import (
    SessionReplay,
)
from shell.cloudyblobject import (
    CloudyBlobject,
)


class TestSessionReplay(unittest.TestCase):
    def test_missing(self):
        """
        Test that a missing session returns None.
        """
        session_replay = SessionReplay.find("missing")
        self.assertIsNone(session_replay)

    def test_find_or_create(self):
        """
        Test that find_or_create returns a new session.
        """
        session_replay = SessionReplay.find_or_create("new_session")
        self.assertIsNotNone(session_replay)
        self.assertEqual(session_replay.id, "new_session")
        session_replay2 = SessionReplay.find_or_create("new_session")
        self.assertEqual(session_replay.id, session_replay2.id)

    def test_append(self):
        """
        Test that append works.
        """
        session_replay = SessionReplay.find_or_create("append")
        session_replay.append(bytes("hello", "utf-8"))
        session_replay.save()
        self.assertEqual(SessionReplay.find_or_create("append").to_str(), "hello")
        session_replay.append(bytes("hello2", "utf-8"))
        session_replay.save()
        self.assertEqual(
            SessionReplay.find_or_create("append").to_str(),
            "hellohello2",
        )

    def tearDown(self):
        CloudyBlobject._storage_driver.delete_all()
        super().tearDown()
