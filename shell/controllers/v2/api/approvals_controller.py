import tornado.web
import datetime
import json

from shell.models.approval import Approval
from shell.controllers.v2 import BaseMixin
from shell.models.base import Base

from shell.utils import json_decode
from shell.utils import get_current_time
from shell.models.prompt import Prompt


def routes(**kwargs):
    return [
        (
            r"/api/approvals",
            ApprovalsController,
            kwargs,
        ),
        (
            r"/api/approvals/(\d+)",
            ApprovalController,
            kwargs,
        ),
    ]


class ApprovalsController(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def initialize(self, loop, **kwargs):
        super(ApprovalsController, self).initialize(loop)

    @tornado.web.authenticated
    def get(self):
        _approvals = Approval.all()
        approvals = sorted(_approvals, key=lambda a: a.created_at, reverse=True)

        self.write({"approvals": approvals})

    @tornado.web.authenticated
    def post(self):
        data = json_decode(self.request.body)
        slug = data.get("slug", None)
        reason = data.get("reason", None)
        current_user = self.get_current_user()
        ip, port = self.get_client_addr()
        human_location = self.get_human_location(ip)

        if slug:
            prompt = Prompt.get(slug)
            if prompt is None:
                self.set_status(400)
                raise tornado.web.HTTPError(
                    400, "No prompt found for '{}'.".format(slug)
                )

            metadata = {
                "action": "SSH to remote server from {}".format(prompt.hostname),
                "destination_server": prompt.hostname,
                "destination_username": prompt.username,
                "location": ip,
                "port": port,
                "certificate_authentication": self._is_certificate_authentication_enabled(),
                "human_location": human_location,
            }

            try:
                approval_request = Approval.create(
                    requestor=current_user,
                    reason=reason,
                    ip_address=ip,
                    prompt=json.dumps(prompt.labels),
                    metadata_=metadata,
                )

                print("approval request id: " + str(approval_request.id))

                self.set_status(201)
                self.write_api({"approval_request_id": approval_request.id})
                return
            except Exception as e:
                print("error: " + str(e))
                Base.session.rollback()
                raise tornado.web.HTTPError(400, "Can't request approval.")


class ApprovalController(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def initialize(self, loop, **kwargs):
        super(ApprovalController, self).initialize(loop)

    @tornado.web.authenticated
    def get(self, approval_id):
        try:
            approval = Approval.find_or_fail(approval_id)
            self.write({"approval": approval})
        except Exception as exception:
            raise tornado.web.HTTPError(404, str(exception))

    @tornado.web.authenticated
    def patch(self, approval_id):
        try:
            approval = Approval.find_or_fail(approval_id)
        except Exception as exception:
            raise tornado.web.HTTPError(404, str(exception))

        params = json_decode(self.request.body)
        new_status = params.get("status")
        current_user = self.get_current_user()

        try:
            update_approval_status(approval, current_user, new_status)
            approval.update(responder=current_user)
        except Exception as exception:
            self.write({"status": 422, "reason": exception.args[0]})
            return

        self.set_status(200)
        self.write({"status": 200, "approval": approval})


def authorized_to_approve(approval, current_user):
    approval_settings = approval.approval_settings
    if not approval_settings:
        return True
    if approval_settings.self_approval is True:
        return True

    authorized_approval_users = approval_settings.authorized_approval_users
    for user in authorized_approval_users:
        if user.id == current_user.id:
            return True

    authorized_approval_groups = approval_settings.authorized_approval_groups
    for group in authorized_approval_groups:
        for user in group.users:
            if user.id == current_user.id:
                return True

    return False


def update_approval_status(approval, current_user, new_status):
    old_status = approval.status
    if approval.is_timed_out is True and approval.status != "timed out":
        approval.timeout()
        raise tornado.web.HTTPError(
            400, str("Cannot update once approval is timed out")
        )

    if authorized_to_approve(approval, current_user) is False:
        raise tornado.web.HTTPError(403, str("Not authorized to approve"))

    if new_status == "approved":
        if old_status != "requested":
            raise tornado.web.HTTPError(400, str("Can only approve open requests"))
        else:
            approval.approve()
            if approval.approval_settings:
                delta = approval.approval_settings.approval_duration
                approval.update(
                    expired_at=(
                        get_current_time() + datetime.timedelta(seconds=delta * 60)
                    )
                )
    elif new_status == "denied":
        if old_status != "requested":
            raise tornado.web.HTTPError(400, str("Can only deny open requests"))
        else:
            approval.deny()
    elif new_status == "cancelled":
        if old_status != "requested":
            raise tornado.web.HTTPError(400, str("Can only cancel open requests"))
        else:
            approval.cancel()
    else:
        raise tornado.web.HTTPError(400, str("Invalid status"))

    return approval
