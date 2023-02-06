import logging
import tornado
from pubsub import pub

from shell.controllers.v2 import BaseMixin
from shell.models import SessionReplay


class WebsocketShareController(BaseMixin, tornado.websocket.WebSocketHandler):
    def initialize(self, loop):
        super(WebsocketShareController, self).initialize(loop)

    def listener(self, msg):
        self.write_message(msg)

    def open(self, share_id):
        # write scrollback
        replay = SessionReplay.find(share_id)

        if replay is not None:
            self.write_message(replay.data)

        topic = "session:{}".format(share_id)
        pub.subscribe(self.listener, topic)
        logging.debug("WebSocket opened, listening for topic: " + topic)

    def on_message(self, message):
        logging.debug(message)

    def on_close(self):
        logging.debug("WebSocket closed")
