import tornado
import json

from shell.controllers.v2 import BaseMixin

from shell.models import UserAccess, GroupAccess
from shell.utils import json_decode


class APIPromptAccessController(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def initialize(self, loop):
        super(APIPromptAccessController, self).initialize(loop)

    @tornado.web.authenticated
    def get(self):
        self.write(
            {
                "data": {
                    "user_accesses": UserAccess._read(),
                    "group_accesses": GroupAccess._read(),
                }
            }
        )

    @tornado.web.authenticated
    def post(self):
        data = json_decode(self.request.body)
        type = self.get_argument("type")

        # Here we use function _write for convenience. It is a protected function and should be only available to other classes if necessary, although not part of the class' normal API.
        if type == "user":
            UserAccess._write(data)
        elif type == "group":
            GroupAccess._write(data)
        else:
            self.set_status(422)
            return

        self.set_status(200)
