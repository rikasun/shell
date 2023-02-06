import tornado
import re
import datetime

from shell.models import Approval, LogEntry, Program
from shell.controllers.v2 import BaseMixin
from shell.utils import get_current_time, json_decode


def routes(**kwargs):
    return [
        (
            r"/api/approval-check",
            ApprovalCheckController,
            kwargs,
        ),
        (
            r"/api/approval-status",
            ApprovalStatusController,
            kwargs,
        ),
    ]


# check if approval is required for a command
class ApprovalCheckController(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def initialize(self, loop):
        super(ApprovalCheckController, self).initialize(loop)

    def log_command_session(self, command):
        programs = Program.all()
        commands = list(map(lambda command: command.path, programs))
        should_match = re.match("(^" + (")|(^").join(commands) + ")", command)

        match = bool(should_match)
        log_entry = None
        if match == True:
            matched_string = should_match.group(0)
            program = Program().find_by(path=matched_string)[0]
            ip, _ = self.get_client_addr()
            human_location = self.get_human_location(ip)

            log_entry = LogEntry.create(
                creator=self.get_current_user(),
                program=program,
                ip_address=ip,
                metadata_={"human_location": human_location, "record_output": False},
            )

        if log_entry:
            return log_entry.id

        return None

    @tornado.web.authenticated
    def post(self):
        data = json_decode(self.request.body)

        current_line_data = data["current_line_data"]

        splitted = current_line_data.split("\u200B\u200B", 1)

        if len(splitted) <= 1:
            command = splitted[0].lstrip()
        else:
            command = splitted[1].lstrip()
        command = "heroku access"
        print("checking if approval required for program/command: {}".format(command))

        # Log session if program exists, regardless of approval required or not
        log_entry_id = self.log_command_session(command)
        result = self._check_appproval_required(command)

        self.write(
            {
                "data": {
                    "needs_approval": result,
                    "command": command,
                    "log_entry_id": log_entry_id,
                }
            }
        )


# check if approval request is approved
class ApprovalStatusController(BaseMixin, tornado.web.RequestHandler):
    def initialize(self, loop):
        super(ApprovalStatusController, self).initialize(loop)

    @tornado.web.authenticated
    def get(self):
        approval_id = self.get_argument("approval_id", None)
        approval = Approval.find(approval_id)

        if approval.status == "requested" and approval.within_approval_window:
            approval.approve()
            if approval.approval_settings:
                delta = approval.approval_settings.approval_duration
                approval.update(
                    expired_at=(get_current_time() + datetime.timedelta(minutes=delta))
                )
            self.set_status(200)
        elif approval.status == "approved":
            self.set_status(200)
        elif approval.status == "denied":
            self.set_status(401)
            self.write({"reason": "Session is denied"})
        elif approval.status == "cancelled":
            self.set_status(410)
            self.write({"reason": "Session is canceled"})
        elif approval.status == "timed out":
            self.set_status(408)
        else:
            self.set_status(201)

        return
