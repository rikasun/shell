import tornado.web

from shell.models import Group
from shell.controllers.v2 import BaseMixin


def routes(**kwargs):
    return [
        (r"/api/groups", GroupsHandler, kwargs),
        (r"/api/groups/(\d+)", GroupHandler, kwargs),
    ]


class GroupsHandler(BaseMixin, tornado.web.RequestHandler):
    def initialize(self, loop):
        super(GroupsHandler, self).initialize(loop)

    @tornado.web.authenticated
    def get(self):
        groups = Group.all()
        self.write({"group": groups})


class GroupHandler(BaseMixin, tornado.web.RequestHandler):
    def initialize(self, loop):
        super(GroupHandler, self).initialize(loop)

    @tornado.web.authenticated
    def get(self, id):
        try:
            group = Group.find_or_fail(id)
            users = group.users
        except Exception as e:
            raise tornado.web.HTTPError(404, str(e))

        self.write({"group": group, "group_users": users})
