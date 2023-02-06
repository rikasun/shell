import unittest
from shell.models import (
    UserAccess,
)
from shell.cloudyblobject import (
    CloudyBlobject,
)


class TestUserAccess(unittest.TestCase):
    def test_round_trip(self):
        j = UserAccess.create(email="dev@cased.com", labels={"app": "rails"})
        j2 = UserAccess.find("dev@cased.com")
        self.assertEqual(j2.labels, {"app": "rails"})
        self.assertEqual(len(UserAccess.list()), 1)

    def tearDown(self):
        CloudyBlobject._storage_driver.delete_all()
        UserAccess.cache = None
        super().tearDown()
