import unittest
import paramiko

from tornado.httputil import HTTPServerRequest
from tornado.options import options
from tests.utils import read_file, make_tests_data_path
from shell import controllers

from shell.controllers.v2.api.websocket_prompt_controller import (
    BaseMixin,
    WebsocketPromptController,
)
from shell.controllers.v2.base_mixin import PrivateKey
from shell.errors import InvalidValueError

try:
    from unittest.mock import Mock
except ImportError:
    from mock import Mock


class TestBaseMixin(unittest.TestCase):
    def test_is_forbidden(self):
        base_mixin = BaseMixin()
        controllers.redirecting = True
        options.fbidhttp = True

        context = Mock(
            address=("8.8.8.8", 8888),
            trusted_downstream=["127.0.0.1"],
            _orig_protocol="http",
        )
        hostname = "4.4.4.4"
        self.assertTrue(base_mixin.is_forbidden(context, hostname))

        context = Mock(
            address=("8.8.8.8", 8888), trusted_downstream=[], _orig_protocol="http"
        )
        hostname = "www.google.com"
        self.assertEqual(base_mixin.is_forbidden(context, hostname), False)

        context = Mock(
            address=("8.8.8.8", 8888), trusted_downstream=[], _orig_protocol="http"
        )
        hostname = "4.4.4.4"
        self.assertTrue(base_mixin.is_forbidden(context, hostname))

        context = Mock(
            address=("192.168.1.1", 8888), trusted_downstream=[], _orig_protocol="http"
        )
        hostname = "www.google.com"
        self.assertIsNone(base_mixin.is_forbidden(context, hostname))

        options.fbidhttp = False
        self.assertIsNone(base_mixin.is_forbidden(context, hostname))

        hostname = "4.4.4.4"
        self.assertIsNone(base_mixin.is_forbidden(context, hostname))

        controllers.redirecting = False
        self.assertIsNone(base_mixin.is_forbidden(context, hostname))

        context._orig_protocol = "https"
        self.assertIsNone(base_mixin.is_forbidden(context, hostname))

    def test_get_redirect_url(self):
        base_mixin = BaseMixin()
        hostname = "www.example.com"
        uri = "/"
        port = 443

        self.assertEqual(
            base_mixin.get_redirect_url(hostname, port, uri=uri),
            "https://www.example.com/",
        )

        port = 4433
        self.assertEqual(
            base_mixin.get_redirect_url(hostname, port, uri),
            "https://www.example.com:4433/",
        )

    def test_get_client_addr(self):
        base_mixin = BaseMixin()
        client_addr = ("8.8.8.8", 8888)
        context_addr = ("127.0.0.1", 1234)
        options.xheaders = True

        base_mixin.context = Mock(address=context_addr)
        base_mixin.get_real_client_addr = lambda: None
        self.assertEqual(base_mixin.get_client_addr(), context_addr)

        base_mixin.context = Mock(address=context_addr)
        base_mixin.get_real_client_addr = lambda: client_addr
        self.assertEqual(base_mixin.get_client_addr(), client_addr)

        options.xheaders = False
        base_mixin.context = Mock(address=context_addr)
        base_mixin.get_real_client_addr = lambda: client_addr
        self.assertEqual(base_mixin.get_client_addr(), context_addr)

    def test_get_real_client_addr(self):
        x_forwarded_for = "1.1.1.1"
        x_forwarded_port = 1111
        x_real_ip = "2.2.2.2"
        x_real_port = 2222
        fake_port = 65535

        base_mixin = BaseMixin()
        base_mixin.request = HTTPServerRequest(uri="/")
        base_mixin.request.remote_ip = x_forwarded_for

        self.assertIsNone(base_mixin.get_real_client_addr())

        base_mixin.request.headers.add("X-Forwarded-For", x_forwarded_for)
        self.assertEqual(
            base_mixin.get_real_client_addr(), (x_forwarded_for, fake_port)
        )

        base_mixin.request.headers.add("X-Forwarded-Port", fake_port + 1)
        self.assertEqual(
            base_mixin.get_real_client_addr(), (x_forwarded_for, fake_port)
        )

        base_mixin.request.headers["X-Forwarded-Port"] = x_forwarded_port
        self.assertEqual(
            base_mixin.get_real_client_addr(), (x_forwarded_for, x_forwarded_port)
        )

        base_mixin.request.remote_ip = x_real_ip

        base_mixin.request.headers.add("X-Real-Ip", x_real_ip)
        self.assertEqual(base_mixin.get_real_client_addr(), (x_real_ip, fake_port))

        base_mixin.request.headers.add("X-Real-Port", fake_port + 1)
        self.assertEqual(base_mixin.get_real_client_addr(), (x_real_ip, fake_port))

        base_mixin.request.headers["X-Real-Port"] = x_real_port
        self.assertEqual(base_mixin.get_real_client_addr(), (x_real_ip, x_real_port))


class TestPrivateKey(unittest.TestCase):
    def get_pk_obj(self, fname, password=None):
        key = read_file(make_tests_data_path(fname))
        return PrivateKey(key, password=password, filename=fname)

    def _test_with_encrypted_key(self, fname, password, klass):
        pk = self.get_pk_obj(fname, password="")
        with self.assertRaises(InvalidValueError) as ctx:
            pk.get_pkey_obj()
        self.assertIn("Need a passphrase", str(ctx.exception))

        pk = self.get_pk_obj(fname, password="wrongpass")
        with self.assertRaises(InvalidValueError) as ctx:
            pk.get_pkey_obj()
        self.assertIn("wrong passphrase", str(ctx.exception))

        pk = self.get_pk_obj(fname, password=password)
        self.assertIsInstance(pk.get_pkey_obj(), klass)

    def test_class_with_invalid_key_length(self):
        key = "a" * (PrivateKey.max_length + 1)

        with self.assertRaises(InvalidValueError) as ctx:
            PrivateKey(key)
        self.assertIn("Invalid key length", str(ctx.exception))

    def test_get_pkey_obj_with_invalid_key(self):
        key = "a b c"
        fname = "abc"

        pk = PrivateKey(key, filename=fname)
        with self.assertRaises(InvalidValueError) as ctx:
            pk.get_pkey_obj()
        self.assertIn("Invalid key {}".format(fname), str(ctx.exception))

    def test_get_pkey_obj_with_plain_rsa_key(self):
        pk = self.get_pk_obj("test_rsa.key")
        self.assertIsInstance(pk.get_pkey_obj(), paramiko.RSAKey)

    def test_get_pkey_obj_with_plain_ed25519_key(self):
        pk = self.get_pk_obj("test_ed25519.key")
        self.assertIsInstance(pk.get_pkey_obj(), paramiko.Ed25519Key)

    def test_get_pkey_obj_with_encrypted_rsa_key(self):
        fname = "test_rsa_password.key"
        password = "television"
        self._test_with_encrypted_key(fname, password, paramiko.RSAKey)

    def test_get_pkey_obj_with_encrypted_ed25519_key(self):
        fname = "test_ed25519_password.key"
        password = "abc123"
        self._test_with_encrypted_key(fname, password, paramiko.Ed25519Key)

    def test_get_pkey_obj_with_encrypted_new_rsa_key(self):
        fname = "test_new_rsa_password.key"
        password = "123456"
        self._test_with_encrypted_key(fname, password, paramiko.RSAKey)

    def test_get_pkey_obj_with_plain_new_dsa_key(self):
        pk = self.get_pk_obj("test_new_dsa.key")
        self.assertIsInstance(pk.get_pkey_obj(), paramiko.DSSKey)

    def test_parse_name(self):
        key = "-----BEGIN PRIVATE KEY-----"
        pk = PrivateKey(key)
        name, _ = pk.parse_name(pk.iostr, pk.tag_to_name)
        self.assertIsNone(name)

        key = "-----BEGIN xxx PRIVATE KEY-----"
        pk = PrivateKey(key)
        name, _ = pk.parse_name(pk.iostr, pk.tag_to_name)
        self.assertIsNone(name)

        key = "-----BEGIN  RSA PRIVATE KEY-----"
        pk = PrivateKey(key)
        name, _ = pk.parse_name(pk.iostr, pk.tag_to_name)
        self.assertIsNone(name)

        key = "-----BEGIN RSA  PRIVATE KEY-----"
        pk = PrivateKey(key)
        name, _ = pk.parse_name(pk.iostr, pk.tag_to_name)
        self.assertIsNone(name)

        key = "-----BEGIN RSA PRIVATE  KEY-----"
        pk = PrivateKey(key)
        name, _ = pk.parse_name(pk.iostr, pk.tag_to_name)
        self.assertIsNone(name)

        for tag, to_name in PrivateKey.tag_to_name.items():
            key = "-----BEGIN {} PRIVATE KEY----- \r\n".format(tag)
            pk = PrivateKey(key)
            name, length = pk.parse_name(pk.iostr, pk.tag_to_name)
            self.assertEqual(name, to_name)
            self.assertEqual(length, len(key))


class TestWebsocketPromptController(unittest.TestCase):
    def test_check_origin(self):
        request = HTTPServerRequest(uri="/")
        obj = Mock(spec=WebsocketPromptController, request=request)

        obj.origin_policy = "same"
        request.headers["Host"] = "www.example.com:4433"
        origin = "https://www.example.com:4433"
        self.assertTrue(WebsocketPromptController.check_origin(obj, origin))

        origin = "https://www.example.com"
        self.assertFalse(WebsocketPromptController.check_origin(obj, origin))

        obj.origin_policy = "primary"
        self.assertTrue(WebsocketPromptController.check_origin(obj, origin))

        origin = "https://blog.example.com"
        self.assertTrue(WebsocketPromptController.check_origin(obj, origin))

        origin = "https://blog.example.org"
        self.assertFalse(WebsocketPromptController.check_origin(obj, origin))

        origin = "https://blog.example.org"
        obj.origin_policy = {"https://blog.example.org"}
        self.assertTrue(WebsocketPromptController.check_origin(obj, origin))

        origin = "http://blog.example.org"
        obj.origin_policy = {"http://blog.example.org"}
        self.assertTrue(WebsocketPromptController.check_origin(obj, origin))

        origin = "http://blog.example.org"
        obj.origin_policy = {"https://blog.example.org"}
        self.assertFalse(WebsocketPromptController.check_origin(obj, origin))

        obj.origin_policy = "*"
        origin = "https://blog.example.org"
        self.assertTrue(WebsocketPromptController.check_origin(obj, origin))
