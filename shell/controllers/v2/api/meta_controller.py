import os
import tornado

from shell.controllers.v2 import BaseMixin


class APIMetaController(BaseMixin, tornado.web.RequestHandler):
    def initialize(self, loop):
        super(APIMetaController, self).initialize(loop)

    @tornado.web.authenticated
    def get(self):
        self.write({"cased_server": os.getenv("CASED_SERVER_ADDR")})
