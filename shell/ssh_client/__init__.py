import logging
import os
import paramiko
import six
import socket
import threading
import time

from paramiko.message import Message

from paramiko.common import (
    cMSG_SERVICE_REQUEST,
)

from paramiko.ssh_exception import (
    SSHException,
    AuthenticationException,
    BadAuthenticationType,
    PartialAuthentication,
)

# https://github.com/paramiko/paramiko/blob/93dba53fba7da34f34660ac4f5fba4cae317a6ed/paramiko/pkey.py#L47-L59
def my_unpad_openssh(data):
    # At the moment, this is only used for unpadding private keys on disk. This
    # really ought to be made constant time (possibly by upstreaming this logic
    # into pyca/cryptography).
    padding_length = six.indexbytes(data, -1)
    if 0x20 <= padding_length < 0x7F:
        return data  # no padding, last byte part comment (printable ascii)
    if padding_length == 0:
        return data  # no padding and no comment apparently, fixes 'invalid key curve identifier' on keys generated with step
    if padding_length > 15:
        raise SSHException("Invalid key")
    for i in range(padding_length):
        if six.indexbytes(data, i - padding_length) != i + 1:
            raise SSHException("Invalid key")
    return data[:-padding_length]


paramiko.pkey._unpad_openssh = my_unpad_openssh

# paramiko_logger = logging.getLogger("paramiko")
# paramiko_logger.setLevel(logging.DEBUG)

# handler = logging.StreamHandler()
# handler.setLevel(logging.DEBUG)

# paramiko_logger.addHandler(handler)


class KeyboardInteractiveAuthenticationException(Exception):
    def __init__(self, message="", handler=None):
        self.handler = handler
        super().__init__(message)


class KeyboardInteractiveAuthenticationHandler:
    def __init__(self, event):
        self.event = event
        self.answers = []
        self.interactive_authentication_ready = threading.Event()
        self.interval = 5
        self.timeout = 30
        self.title = None
        self.instructions = None
        self.prompt_list = None

    def answer(self, answers):
        self.answers = answers
        self.interactive_authentication_ready.set()

    def is_ready(self):
        return self.interactive_authentication_ready.is_set()

    def handler(self, title, instructions, prompt_list):
        logging.info(
            "Interactive authentication: {} {} {}".format(
                title, instructions, prompt_list
            )
        )
        self.title = title
        self.instructions = instructions
        self.prompt_list = prompt_list
        self.event.set()
        t_end = time.time() + self.timeout
        while not self.is_ready() and time.time() < t_end:
            if self.interactive_authentication_ready.wait(self.interval):
                logging.info("returning answers")
                return self.answers
            else:
                logging.info("not answered yet...")

        raise paramiko.AuthenticationException(
            "KeyboardInteractiveAuthenticationHandler timed out after {} seconds".format(
                self.timeout
            )
        )


class SSHClient(paramiko.SSHClient):
    def __init__(self):
        self.authentication_completed = False
        self.more_info_event = None
        self.keyboard_interactive_handler = None
        super().__init__()

    def connect_with_jump(self, args, proxy_jump=None, more_info_event=None):
        # args = (hostname, port, username, password, pkey, session_id)
        hostname = args[0]
        port = args[1]
        password = args[3]
        pkey = args[4]
        session_id = args[-1]
        sock = None
        closers = []
        if proxy_jump is not None and proxy_jump != "null":
            jump_user_and_hostname, jump_port = proxy_jump.split(":")
            jump_user, jump_hostname = jump_user_and_hostname.split("@")
            proxy_jump_args = (
                jump_hostname,
                jump_port,
                jump_user,
                password,
                pkey,
                session_id,
            )
            proxy_jump_ssh = self.connect_once(
                proxy_jump_args, more_info_event=more_info_event
            )
            sock = proxy_jump_ssh.get_transport().open_channel(
                "direct-tcpip", (hostname, int(port)), ("", 0)
            )
            closers.append(sock)
            closers.append(proxy_jump_ssh)

        self.connect_once(args, sock=sock, more_info_event=more_info_event)

        return self, closers

    def connect_once(self, args, sock=None, more_info_event=None):
        dst_addr = args[:2]
        logging.info("Connecting to {}:{}".format(*dst_addr))
        try:
            self.more_info_event = more_info_event
            self.connect(*args, timeout=3, sock=sock)
            _interval = os.getenv("CASED_SHELL_KEEPALIVE_INTERVAL", "30")
            interval = int(_interval)
            transport = self.get_transport()
            transport.set_keepalive(interval)
        except socket.error as e:
            logging.info(
                "Error connecting via SSH. Likely that host is not visible: {}".format(
                    str(e)
                )
            )
            raise ValueError("Unable to connect to {}:{}".format(*dst_addr))
        except paramiko.BadAuthenticationType:
            raise ValueError(
                "Authentication failed. Please check the address of your host, and your ssh key."
            )
        except paramiko.AuthenticationException:
            raise ValueError("Authentication failed.")
        except paramiko.BadHostKeyException:
            raise ValueError("Bad host key.")

        return self

    def setup_handler(self):
        event = threading.Event()
        handler = paramiko.AuthHandler(self._transport)
        handler.auth_event = event
        return handler

    def send_auth_message(self):
        if not self._transport.is_active():
            return []

        self._transport.lock.acquire()

        m = Message()
        if self.first_time:
            m.add_byte(cMSG_SERVICE_REQUEST)
        m.add_string("ssh-userauth")
        m.rewind()
        if self.first_time:
            self._transport._send_message(m)
        else:
            self._transport.auth_handler._parse_service_accept(m)
        self._transport.lock.release()
        response = self._transport.auth_handler.wait_for_response(
            self._transport.auth_handler.auth_event
        )
        handler_exception = self._transport.auth_handler.transport.get_exception()
        if handler_exception is not None:
            logging.error(
                "{}: handler_exception: {}".format(response, handler_exception)
            )
            raise handler_exception
        return response

    def _auth(self, username, password, pkey, *args):
        try:
            self._auth_without_raise(username, password, pkey, *args)
        except Exception as e:
            logging.error("authentication_completed exception: {}".format(e))
            self.authentication_completed = True
            raise e
        else:
            self.authentication_completed = True

    def _auth_without_raise(self, username, password, pkey, *args):
        # wtf paramiko
        self.password = password
        saved_exception = None
        self.supported_types = {"keyboard-interactive", "password", "publickey"}
        self.types_to_attempt = {"keyboard-interactive"}

        if pkey is not None:
            self.types_to_attempt.add("publickey")
        if password is not None:
            self.types_to_attempt.add("password")

        self.first_time = True

        while (
            len(self.types_to_attempt) > 0
            and self._transport.active
            and not self._transport.is_authenticated()
        ):
            unsupported = self.types_to_attempt - self.supported_types
            if len(unsupported) > 0:
                raise BadAuthenticationType(
                    "Unsupported auth types: {}".format(unsupported)
                )

            try:
                if "publickey" in self.types_to_attempt:
                    logging.info(
                        "{}: Trying publickey authentication".format(
                            self.types_to_attempt
                        )
                    )
                    try:
                        self._transport.auth_timeout = 10
                        self._transport.auth_handler = self.setup_handler()
                        self._transport.auth_handler.auth_method = "publickey"
                        self._transport.auth_handler.username = username
                        self._transport.auth_handler.private_key = pkey
                        self.types_to_attempt = self.send_auth_message()
                    except BadAuthenticationType as e:
                        raise e
                    except AuthenticationException as e:
                        saved_exception = e
                    finally:
                        self.first_time = False

                if "password" in self.types_to_attempt:
                    logging.info(
                        "{}: Trying password authentication".format(
                            self.types_to_attempt
                        )
                    )
                    try:
                        self._transport.auth_timeout = 10
                        self._transport.auth_handler = self.setup_handler()
                        self._transport.auth_handler.auth_method = "password"
                        self._transport.auth_handler.username = username
                        self._transport.auth_handler.password = password
                        self.types_to_attempt = self.send_auth_message()
                    except BadAuthenticationType as e:
                        raise e
                    except AuthenticationException as e:
                        saved_exception = e
                    finally:
                        self.first_time = False

                if "keyboard-interactive" in self.types_to_attempt:
                    logging.info(
                        "{}: Trying keyboard-interactive authentication".format(
                            self.types_to_attempt
                        )
                    )
                    try:
                        self._transport.auth_timeout = 120
                        self._transport.auth_handler = self.setup_handler()
                        self._transport.auth_handler.auth_method = (
                            "keyboard-interactive"
                        )
                        self._transport.auth_handler.username = username
                        self.keyboard_interactive_handler = (
                            KeyboardInteractiveAuthenticationHandler(
                                self.more_info_event
                            )
                        )
                        self._transport.auth_handler.interactive_handler = (
                            self.keyboard_interactive_handler.handler
                        )
                        self._transport.auth_handler.submethods = ""
                        self.types_to_attempt = self.send_auth_message()
                    except BadAuthenticationType as e:
                        raise e
                    except AuthenticationException as e:
                        saved_exception = e
                    finally:
                        self.first_time = False

            except PartialAuthentication as e:
                logging.info("Partial authentication")
                types = set(getattr(e, "allowed_types", []))
                if len(types) > 0:
                    self.types_to_attempt = types
                    logging.info("Unsatisfied types: {}".format(self.types_to_attempt))
                saved_exception = e

        if not self._transport.is_authenticated():
            assert saved_exception is not None
            if self._transport.saved_exception is None:
                self._transport.saved_exception = saved_exception
            raise self._transport.saved_exception

    def exec_command_chan(self, command, term="vt100"):
        chan = self._transport.open_session()
        chan.get_pty(term=term)
        chan.exec_command(command)
        return chan
