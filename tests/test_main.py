import unittest

from tornado.web import Application
from shell import controllers

from shell.main import app_listen


class TestMain(unittest.TestCase):
    def test_app_listen(self):
        app = Application()
        app.listen = lambda x, y, **kwargs: 1

        controllers.redirecting = None
        server_settings = dict()
        app_listen(app, 80, "127.0.0.1", server_settings)
        self.assertFalse(controllers.redirecting)

        controllers.redirecting = None
        server_settings = dict(ssl_options="enabled")
        app_listen(app, 80, "127.0.0.1", server_settings)
        self.assertTrue(controllers.redirecting)
