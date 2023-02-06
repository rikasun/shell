import io
import json
import random
import threading
import os
import mock
from mock import patch
import tornado.websocket
import tornado.gen

from tornado.testing import AsyncHTTPTestCase

from tornado.httpclient import HTTPError
from tornado.options import options
from tests.sshserver import run_ssh_server, banner, Server
from tests.utils import (
    encode_multipart_formdata,
    read_file,
    make_tests_data_path,
)  # noqa
from shell import controllers
from shell.main import make_app, make_handlers
from shell.settings import get_app_settings, get_server_settings, base_dir
from shell.utils import to_str
from tests.utils import generate_test_jwt, PatchMixin
from shell.models.worker import Worker

try:
    from urllib.parse import urlencode
except ImportError:
    from urllib import urlencode


swallow_http_errors = controllers.swallow_http_errors
server_encodings = {e.strip() for e in Server.encodings}

jwt = generate_test_jwt()

settings_data = {
    "settings": {"reason_required": False},
    "guard_application": {"settings: {}"},
}
instance_data = {}
session_request_data = (200, {})


class MockSFTP:
    def __init__(self):
        self.open = True
        self.files = {}
        self.getfos = {}

    def putfo(self, file_obj, remote_path):
        self.files.update({remote_path: file_obj.read()})

    def getfo(self, remote_path, _local_path):
        self.getfos.update({remote_path: True})

    def close(self):
        self.open = False

    def cleanup(self):
        self.open = False
        self.files = {}
        self.getfos = {}


class MockTransport:
    def __init__(self):
        self.opens = []

    def open_channel(self, *args):
        self.opens.append(args)
        return None

    def set_keepalive(self, *args):
        pass

    def cleanup(self):
        self.opens = []


class MockPreDownloadCommand:
    def __init__(self):
        self.commands = []

    def exec(self, command):
        self.commands.append(command)
        return "/tmp/path-to-file"

    def cleanup(self):
        self.commands = []


class TestAppBase(AsyncHTTPTestCase):
    def get_httpserver_options(self):
        return get_server_settings(options)

    def assert_response(self, bstr, response):
        if swallow_http_errors:
            self.assertEqual(response.code, 200)
            self.assertIn(bstr, response.body)
        else:
            self.assertEqual(response.code, 400)
            self.assertIn(b"Bad Request", response.body)

    def assert_status_in(self, status, data):
        self.assertIsNone(data["encoding"])
        self.assertIsNone(data["id"])
        self.assertIn(status, data["status"])

    def assert_status_equal(self, status, data):
        self.assertIsNone(data["encoding"])
        self.assertIsNone(data["id"])
        self.assertEqual(status, data["status"])

    def assert_session_and_status_none(self, data):
        self.assertIsNotNone(data["encoding"])
        self.assertIsNotNone(data["id"])
        self.assertIsNotNone(data["session_id"])
        self.assertIsNotNone(data["hostname"])
        self.assertIsNotNone(data["port"])
        self.assertIsNotNone(data["username"])
        self.assertIsNone(data["status"])

    def fetch_request(self, url, method="GET", body="", headers={}, sync=True):
        if not sync and url.startswith("/"):
            url = self.get_url(url)

        if isinstance(body, dict):
            body = urlencode(body)

        if not headers:
            headers = self.headers
        else:
            headers.update(self.headers)

        client = self if sync else self.get_http_client()
        return client.fetch(url, method=method, body=body, headers=headers)

    def sync_post(self, url, body, headers={}):
        return self.fetch_request(url, "POST", body, headers)

    def async_post(self, url, body, headers={}):
        return self.fetch_request(url, "POST", body, headers, sync=False)


class TestAppBaseApp(TestAppBase):

    url_prefix = ""
    running = threading.Event()
    sshserver_port = 2200
    body = (
        "hostname=127.0.0.1&port={}&_xsrf=some_xsrf&username=user1&password=foo".format(
            sshserver_port
        )
    )  # noqa
    headers = {"Cookie": "_xsrf=some_xsrf"}

    def get_app(self):
        self.body_dict = {
            "hostname": "127.0.0.1",
            "port": str(self.sshserver_port),
            "username": "user1",
            "password": "",
            "_xsrf": "some_xsrf",
        }
        loop = self.io_loop
        options.debug = False
        options.policy = random.choice(["warning", "autoadd"])
        options.hostfile = ""
        options.syshostfile = ""
        options.tdstream = ""
        options.delay = 0.1
        app = make_app(make_handlers(loop, options), get_app_settings(options))
        return app


from tests.models.test_base import TestBase


class TestV2AppBaseApp(TestAppBaseApp, TestBase):
    url_prefix = "/v2"

    def setUp(self):
        super().setUp()

    def tearDown(self):
        super().tearDown()
