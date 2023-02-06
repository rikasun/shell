import unittest
from shell.models import (
    UserAccess,
)
from tests.models.test_base import TestBase

from shell.cloudyblobject import (
    CloudyBlobject,
)
from unittest import TestCase


class TestRunbook(TestBase):
    def test_connect(self):
        self.assertEqual(1, 1)


if __name__ == "__main__":
    unittest.main()
