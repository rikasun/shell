import tornado.web
import time
import os
import jwt

from shell.controllers.v2 import BaseMixin
from shell.models import User

from shell.utils import json_decode


def routes(**kwargs):
    return [
        (r"/api/jwt", LoginJWTHandler, kwargs),
        (r"/api/refresh", LoginJWTRefreshHandler, kwargs),
    ]


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


class LoginJWTHandler(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def initialize(self, loop):
        super(LoginJWTHandler, self).initialize(loop)

    def post(self):
        params = json_decode(self.request.body)
        email = params.get("email", None)
        password = params.get("password", None)

        _users = User().find_by(email=email)
        if _users:
            user = _users[0]

            if not user.check_password(password):
                self.set_status(401)
                res = {"error": "Email/password combination is invalid"}
                self.write(res)
                return
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

        self.set_secure_cookie("refresh_token", refresh_token, expires_days=7)

        self.set_status(200)

        tokens = {"access_token": access_token, "refresh_token": refresh_token}

        self.write_api(tokens)


class LoginJWTRefreshHandler(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def initialize(self, loop):
        super(LoginJWTRefreshHandler, self).initialize(loop)

    def post(self):
        email = self.get_argument("email", None)
        refresh_token = self.get_argument("refresh_token", None)

        _users = User().find_by(email=email)
        if _users:
            user = _users[0]
        else:
            self.set_status(404)
            res = {"error": "No such user"}
            self.write(res)
            return

        if not refresh_token or refresh_token != self.get_secure_cookie(
            "refresh_token"
        ).decode("utf-8"):
            self.set_status(401)
            res = {"error": "Refresh token is invalid"}
            self.write(res)
            return

        access_token_payload = generate_payload(user, "access", fresh=False)

        cased_secret = os.getenv("JWT_SIGNING_KEY", "insecure")
        access_token = jwt.encode(access_token_payload, cased_secret, algorithm="HS256")

        self.set_status(200)

        tokens = {"access_token": access_token}

        self.write_api(tokens)
