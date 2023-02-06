import unittest
from shell.models import (
    GroupAccess,
)
from shell.cloudyblobject import (
    CloudyBlobject,
)


class TestGroupAccess(unittest.TestCase):
    def test_round_trip(self):
        j = GroupAccess.create(name="devops", labels={"app": "rails"})
        j2 = GroupAccess.find("devops")
        self.assertEqual(j2.labels, {"app": "rails"})
        self.assertEqual(len(GroupAccess.list()), 1)

    def tearDown(self):
        CloudyBlobject._storage_driver.delete_all()
        GroupAccess.cache = None
        super().tearDown()
