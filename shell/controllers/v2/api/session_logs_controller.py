import tornado.web

from shell.models import LogEntry, Group
from shell.controllers.v2 import BaseMixin


def routes(**kwargs):
    return [
        (r"/api/sessions", ActivitySessionsHandler, kwargs),
        (r"/api/sessions/users/(\d+)", UserActivitySessionsHandler, kwargs),
        (r"/api/sessions/groups/(\d+)", GroupActivitySessionsHandler, kwargs),
    ]


class ActivitySessionsHandler(BaseMixin, tornado.web.RequestHandler):
    def initialize(self, loop):
        super(ActivitySessionsHandler, self).initialize(loop)

    @tornado.web.authenticated
    def get(self):
        sessions = LogEntry.sort("-created_at").all()
        self.write({"data": {"sessions": sessions}})


class UserActivitySessionsHandler(BaseMixin, tornado.web.RequestHandler):
    def initialize(self, loop):
        super(UserActivitySessionsHandler, self).initialize(loop)

    @tornado.web.authenticated
    def get(self, user_id):
        sessions = LogEntry().user_sessions(user_id)
        self.write({"data": {"sessions": sessions}})


class GroupActivitySessionsHandler(BaseMixin, tornado.web.RequestHandler):
    def initialize(self, loop):
        super(GroupActivitySessionsHandler, self).initialize(loop)

    @tornado.web.authenticated
    def get(self, group_id):
        # move this to the model level after migration
        group = Group.find(group_id)
        sessions = []

        if group:
            sessions = LogEntry().group_sessions(group)

        self.write({"data": {"sessions": sessions}})
