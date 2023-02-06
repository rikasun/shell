import tornado.web

from shell.models import Base, User, Organization
from shell.controllers.v2 import BaseMixin

from shell.utils import json_decode


def routes(**kwargs):
    return [
        (r"/api/users", UsersHandler, kwargs),
        (r"/api/users/(\d+)", UserHandler, kwargs),
    ]


class UsersHandler(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def initialize(self, loop):
        super(UsersHandler, self).initialize(loop)

    @tornado.web.authenticated
    def get(self):
        users = User.all()
        self.write({"users": users})

    @tornado.web.authenticated
    def post(self):
        params = json_decode(self.request.body)
        email = params.get("email", None)
        password = params.get("password", None)
        admin = params.get("admin", False)
        name = params.get("name", email)

        try:
            user = User.create(
                name=name, email=email, admin=admin, organization=Organization.first()
            )
            user.save_password(password)

            self.set_status(201)
            self.write_api({"user": user})
        except Exception as error:
            Base.session.rollback()
            self.set_status(400)
            raise tornado.web.HTTPError(
                400, "Cannot create user: '{}'.".format(error.args[0])
            )


class UserHandler(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def initialize(self, loop):
        super(UserHandler, self).initialize(loop)

    @tornado.web.authenticated
    def get(self, id):
        try:
            user = User.find_or_fail(id)
            groups = user.groups
        except Exception as e:
            raise tornado.web.HTTPError(404, str(e))

        self.write({"user": user, "user_groups": groups})

    @tornado.web.authenticated
    def patch(self, id):
        params = json_decode(self.request.body)

        try:
            user = User.find_or_fail(id)
        except Exception as e:
            raise tornado.web.HTTPError(404, str(e))

        try:
            user.update(admin=params.get("admin"))
        except Exception as e:
            self.set_status(422)
            self.write({"status": 422, "reason": e.args[0]})
            return

        self.set_status(200)
        self.write({"user": user})
