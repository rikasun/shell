import mimetypes
import os.path
import threading
import time

from uuid import uuid4
from shell.settings import base_dir
from datetime import datetime, timedelta
from shell.utils import generate_jwt
from mock import patch

from tests.sshserver import run_ssh_server, banner, Server


settings_data = {
    "settings": {"reason_required": False},
    "guard_application": {"settings: {}"},
}
instance_data = {}
org_settings = {}
session_request_data = (200, {})


def generate_test_jwt():
    payload = {
        "user_id": "123",
        "user": "admin user",
        "email": "test-admin@cased.com",
        "name": "admin usesr",
        "admin": True,
        "role": "admin",
        "iss": "localhost:8888",
        "iat": int(datetime.now().timestamp()),
        "exp": int((datetime.now() + timedelta(days=10)).timestamp()),
    }

    secret = "shell_1uayaeNIOyQX8vguSEiUhhuU9Dc"
    jwt = generate_jwt(data=payload, secret=secret)

    if type(jwt) is str:
        jwt = jwt.encode("utf-8")

    return jwt


def generate_user_jwt():
    payload = {
        "user_id": "123",
        "user": "user@cased.com",
        "role": "user",
        "iss": "localhost:8888",
        "iat": int(datetime.now().timestamp()),
        "exp": int((datetime.now() + timedelta(days=10)).timestamp()),
    }

    secret = "shell_1uayaeNIOyQX8vguSEiUhhuU9Dc"
    jwt = generate_jwt(data=payload, secret=secret)

    return jwt


jwt = generate_test_jwt()


def make_tests_data_path(filename):
    return os.path.join(base_dir, "tests", "data", filename)


def encode_multipart_formdata(fields, files):
    """
    fields is a sequence of (name, value) elements for regular form fields.
    files is a sequence of (name, filename, value) elements for data to be
    uploaded as files.
    Return (content_type, body) ready for httplib.HTTP instance
    """
    boundary = uuid4().hex
    CRLF = "\r\n"
    L = []
    for (key, value) in fields:
        L.append("--" + boundary)
        L.append('Content-Disposition: form-data; name="%s"' % key)
        L.append("")
        L.append(value)
    for (key, filename, value) in files:
        L.append("--" + boundary)
        L.append(
            'Content-Disposition: form-data; name="%s"; filename="%s"' % (key, filename)
        )
        L.append("Content-Type: %s" % get_content_type(filename))
        L.append("")
        L.append(value)
    L.append("--" + boundary + "--")
    L.append("")
    body = CRLF.join(L)
    content_type = "multipart/form-data; boundary=%s" % boundary
    return content_type, body


def get_content_type(filename):
    return mimetypes.guess_type(filename)[0] or "application/octet-stream"


def read_file(path, encoding="utf-8"):
    with open(path, "rb") as f:
        data = f.read()
        if encoding is None:
            return data
        return data.decode(encoding)


def assert_dict_has_elements(dct, *elements):
    for element in elements:
        assert (
            element in dct and dct[element] is not None
        ), f"{element} should be set: {dct}"


class PatchMixin:

    running = threading.Event()
    sshserver_port = 2200
    body = (
        "hostname=127.0.0.1&port={}&_xsrf=some_xsrf&username=user1&password=foo".format(
            sshserver_port
        )
    )  # noqa
    headers = {"Cookie": "_xsrf=some_xsrf"}

    @classmethod
    def setUpClass(cls):
        cls.running.set()
        print("=" * 20)
        t = threading.Thread(
            target=run_ssh_server,
            args=(cls.sshserver_port, cls.running),
            daemon=True,
        )
        t.start()

        cls.patches = [
            patch.dict(
                os.environ,
                {},
            ),
            patch("shell.models.worker.Worker._log_session_end", return_value=None),
            patch("tornado.web.RequestHandler.get_secure_cookie", return_value=jwt),
        ]

        for p in cls.patches:
            p.start()

    @classmethod
    def tearDownClass(cls):
        cls.running.clear()
        print("=" * 20)
        for patch in cls.patches:
            patch.stop()
