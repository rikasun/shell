import tornado

from shell.controllers.v2 import BaseMixin


class LogoutController(BaseMixin, tornado.web.RequestHandler):
    def initialize(self, loop):
        super(LogoutController, self).initialize(loop)

    def get(self):
        self.clear_all_cookies()
        self.redirect("/v2/auth")
