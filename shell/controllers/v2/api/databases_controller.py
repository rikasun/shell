import tornado.web
import sqlalchemy

from shell.models import Database
from shell.models.base import Base
from shell.controllers.v2 import BaseMixin

from shell.utils import json_decode


def routes(**kwargs):
    return [
        (r"/api/databases", DatabasesHandler, kwargs),
        (r"/api/databases/(\d+)", DatabaseHandler, kwargs),
    ]


class DatabasesHandler(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def initialize(self, loop):
        super(DatabasesHandler, self).initialize(loop)

    @tornado.web.authenticated
    def get(self):
        models = Database.all()
        self.write({"databases": models})

    @tornado.web.authenticated
    def post(self):
        params = json_decode(self.request.body)

        try:
            db = Database.create(
                name=params.get("name"),
                host=params.get("host"),
                port=params.get("port"),
                label=params.get("label"),
                username=params.get("username"),
            )

            password = params.get("password", None)
            if password or password == "":
                db.store_pw(password)

            pw = db.pw()

            self.set_status(201)
            self.write({"database": db, "pw": bool(pw)})
            return

        except sqlalchemy.exc.IntegrityError as e:
            err = "Unable to create database, name already exists."

        except Exception as e:
            err = str(e)

        Base.session.rollback()

        self.set_status(422)
        self.write({"status": 422, "reason": err})
        return


class DatabaseHandler(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def initialize(self, loop):
        super(DatabaseHandler, self).initialize(loop)

    @tornado.web.authenticated
    def get(self, id):
        try:
            db = Database.find_or_fail(id)
            pw = db.pw()
        except Exception as e:
            raise tornado.web.HTTPError(404, str(e))

        self.write({"database": db, "pw": bool(pw)})

    @tornado.web.authenticated
    def patch(self, id):
        params = json_decode(self.request.body)

        try:
            db = Database.find_or_fail(id)
        except Exception as e:
            raise tornado.web.HTTPError(404, str(e))

        try:
            db.update(
                name=params.get("name", db.name),
                host=params.get("host", db.host),
                port=params.get("port", db.port),
                label=params.get("label", db.label),
                username=params.get("username", db.username),
            )

            password = params.get("password", None)
            if password or password == "":
                db.store_pw(password)

            pw = db.pw()

            self.write({"database": db, "pw": bool(pw)})
            return

        except sqlalchemy.exc.IntegrityError as e:
            err = "Unable to update database, name already exists."

        except Exception as e:
            err = str(e)

        Base.session.rollback()

        self.set_status(422)
        self.write({"status": 422, "reason": err})
        return

    @tornado.web.authenticated
    def delete(self, id):
        try:
            db = Database.find_or_fail(id)
        except Exception as e:
            raise tornado.web.HTTPError(404, str(e))

        try:
            db.delete_pw()
            db.delete()
        except Exception as e:
            Base.session.rollback()
            self.set_status(422)
            self.write({"status": 422, "reason": str(e)})
            return

        self.set_status(204)
        self.finish()
