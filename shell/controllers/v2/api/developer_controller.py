import tornado
import time
import os
import jwt

from shell.controllers.v2 import BaseMixin
from shell.models.user import User


def generate_payload(user, token_type, fresh=False):
    current_time = int(time.time())

    seconds = 86400
    if token_type == "refresh":
        exp = current_time + (seconds * 7)  # 7 days
    else:
        exp = current_time + seconds  # 1 day

    payload = {
        "user_id": user.id,
        "user": user.name,
        "email": user.email,
        "role": user.role,
        "provider": "sso",
        "iss": "localhost:8888",
        "iat": current_time,
        "exp": exp,
        "token_type": token_type,
        "fresh": fresh,
    }

    return payload


class ApiDeveloperJwtController(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        # ignore xsrf for api
        pass

    def initialize(self, loop):
        super(ApiDeveloperJwtController, self).initialize(loop)
        self.instance_data = None
        self.validated_token = None

    def post(self):
        email = self.get_argument("email")
        if not email.endswith("cased.dev"):
            self.set_status(403)
            self.write("Permission denied")
            return

        _users = User().find_by(email=email)
        if _users:
            user = _users[0]
        else:
            self.set_status(404)
            res = {"error": "No such user"}
            self.write(res)
            return

        access_token_payload = generate_payload(user, "access", fresh=True)
        refresh_token_payload = generate_payload(user, "refresh")

        cased_secret = os.getenv("JWT_SIGNING_KEY", "insecure")
        access_token = jwt.encode(access_token_payload, cased_secret, algorithm="HS256")
        refresh_token = jwt.encode(
            refresh_token_payload, cased_secret, algorithm="HS256"
        )

        self.set_status(200)

        tokens = {"access_token": access_token, "refresh_token": refresh_token}

        self.write(tokens)


class ApiDeveloperJwtRefreshController(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        # ignore xsrf for api
        pass

    def initialize(self, loop):
        super(ApiDeveloperJwtRefreshController, self).initialize(loop)
        self.instance_data = None
        self.validated_token = None

    def post(self):
        _ = self.get_argument("refresh_token")
        email = self.get_argument("email")

        if not email.endswith("cased.dev"):
            self.set_status(403)
            self.write("Permission denied")
            return

        _users = User().find_by(email=email)
        if _users:
            user = _users[0]
        else:
            self.set_status(404)
            res = {"error": "No such user"}
            self.write(res)
            return

        access_token_payload = generate_payload(user, "access", fresh=False)

        cased_secret = os.getenv("JWT_SIGNING_KEY", "insecure")
        access_token = jwt.encode(access_token_payload, cased_secret, algorithm="HS256")

        self.set_status(200)

        tokens = {"access_token": access_token}

        self.write(tokens)
