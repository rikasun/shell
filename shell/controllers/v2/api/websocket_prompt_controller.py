import logging
import json
import struct
import weakref

import paramiko
import tornado

from tornado.ioloop import IOLoop

from shell.controllers.v2 import BaseMixin
from shell.errors import InvalidValueError
from shell.models.worker import workers_for_session

from shell.utils import UnicodeType

try:
    from json.decoder import JSONDecodeError
except ImportError:
    JSONDecodeError = ValueError


class WebsocketPromptController(BaseMixin, tornado.websocket.WebSocketHandler):
    def initialize(self, loop):
        super(WebsocketPromptController, self).initialize(loop)
        self.worker_ref = None
        self.jwt_validated = False

    def open(self, session_id, worker_id):
        self.session_id = session_id
        self.worker_id = worker_id
        self.src_addr = self.get_client_addr()
        logging.info("Connected from {}:{}".format(*self.src_addr))

    def on_message(self, message):
        logging.debug("{!r} from {}:{}".format(message, *self.src_addr))
        try:
            msg = json.loads(message)
        except JSONDecodeError:
            return

        if not isinstance(msg, dict):
            return

        # Validate the JWT token if it hasn't been validated yet
        if not self.jwt_validated:
            token = msg.get("token")
            if not self.validate_jwt(token):
                logging.error("Websocket authentication failed.")
                self.close(reason="Websocket authentication failed.")
                self.write_message("invalid token")
            else:
                self.jwt_validated = True
                self.write_message("authenticated")
                self._connect_worker()
        else:
            worker = self.worker_ref()
            resize = msg.get("resize")
            if resize and len(resize) == 2:
                try:
                    worker.chan.resize_pty(*resize)
                except (TypeError, struct.error, paramiko.SSHException):
                    pass

            data = msg.get("data")
            if data and isinstance(data, UnicodeType):
                worker.data_to_dst.append(data)
                worker.on_write()

    def on_close(self):
        if not self.close_reason:
            self.close_reason = "client disconnected"

        if self.worker_ref != None:
            self.worker_ref().close(reason=self.close_reason)
            self.worker_ref = None

        logging.info(
            "Disconnected websocket connection from {}:{}".format(*self.src_addr)
        )

    def _connect_worker(self):
        try:
            workers = workers_for_session(self.session_id)
        except LookupError as exc:
            self.close(reason=str(exc))
            return

        logging.debug("workers: {}".format(workers))

        worker = workers.get(self.worker_id)
        if worker:
            self.set_nodelay(True)
            worker.set_handler(self)
            self.worker_ref = weakref.ref(worker)
            self.loop.add_handler(worker.fd, worker, IOLoop.READ)
        else:
            self.close(reason="Websocket authentication failed (no workers).")
