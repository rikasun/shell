import os
import time
import tornado

from shell.controllers.v2 import BaseMixin
from shell._version import __version__ as version


class PingController(BaseMixin, tornado.web.RequestHandler):
    def initialize(self, loop):
        super(PingController, self).initialize(loop)

    def get(self):
        current = int(time.time())
        data = str(current) + "|" + str(version) + "|" + os.getenv("GIT_SHA", "")
        self.write(data)
