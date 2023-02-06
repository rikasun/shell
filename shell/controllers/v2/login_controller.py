import tornado

from shell.controllers.v2 import BaseMixin


class LoginController(BaseMixin, tornado.web.RequestHandler):
    def initialize(self, loop):
        super(LoginController, self).initialize(loop)

    def get(self):
        self.render_html("v2/pages/login.html", skip_user=True)
