import tornado
from tornado.template import Template

from shell.controllers.v2 import BaseMixin
from shell.models import (
    Base,
    ApprovalSettings,
    AuthorizedApprovalUser,
    AuthorizedApprovalGroup,
)
from shell.constants import RESPONDER_FILE
from shell.utils import json_decode


def routes(**kwargs):
    return [
        (
            r"/v2/api/([^/]+)/authorized_responders",
            ApiV2AuthorizedRespondersController,
            kwargs,
        ),
        (
            r"/api/approval_settings/([^/]+)/authorized_responders",
            ApiAuthorizedRespondersController,
            kwargs,
        ),
    ]


class ApiV2AuthorizedRespondersController(BaseMixin, tornado.web.RequestHandler):
    def initialize(self, loop):
        super(ApiV2AuthorizedRespondersController, self).initialize(loop)

    def get(self, approval_settings_id):
        q = self.get_argument("q", None)
        current_user = self.get_current_user()
        organization = current_user.organization
        approval_settings = ApprovalSettings.find(approval_settings_id)

        authorized_responders = (
            approval_settings.authorized_approval_groups
            + approval_settings.authorized_approval_users
        )
        data = authorized_responders

        _available_users = [
            u
            for u in organization.users
            if not u in approval_settings.authorized_approval_users
        ]

        _available_groups = [
            g
            for g in organization.groups
            if not g in approval_settings.authorized_approval_groups
        ]
        if q:
            # show autocomplete search results from available authorized responders based on q
            with open(RESPONDER_FILE) as file:
                template_data = file.read()
                template = Template(template_data)

                available_users = [
                    u
                    for u in _available_users
                    if q.lower() in u.email.lower() or q in u.name.lower()
                ]

                available_groups = [
                    g for g in _available_groups if q.lower() in g.name.lower()
                ]

                # sample results
                # b'\n  <li role="option" data-autocomplete-value="user-1"">admin@cased.dev</li>\n\n
                # <li role="option" data-autocomplete-value="user-2"">developer@cased.dev</li>\n\n
                # <li role="option" data-autocomplete-value="user-3"">user@cased.dev</li>\n\n\n'

                results = template.generate(
                    users=available_users, groups=available_groups
                )

                self.write({"data": results})
        else:
            # show current authorized responder for this approval settings
            self.write({"data": data})

    def post(self, approval_settings_id):
        _id = json_decode(self.request.body).get("id")
        approval_settings = ApprovalSettings.find(approval_settings_id)
        role, id = _id.split("-")
        if role == "user":
            AuthorizedApprovalUser.create(
                user_id=id, approval_settings_id=approval_settings_id
            )
        elif role == "group":
            AuthorizedApprovalGroup.create(
                group_id=id, approval_settings_id=approval_settings_id
            )
        else:
            self.set_status(422)
            self.write({"status": 422, "statusText": "Unable to create"})
            return

        Base.session.commit()
        authorized_responders = (
            approval_settings.authorized_approval_groups
            + approval_settings.authorized_approval_users
        )

        self.write({"data": authorized_responders})

    def delete(self, approval_settings_id):
        _id = self.get_argument("id", None)
        approval_settings = ApprovalSettings.find(approval_settings_id)
        if _id:
            role, id = _id.split("-")
            if role == "user":
                target = AuthorizedApprovalUser().find_by(
                    user_id=id, approval_settings_id=approval_settings_id
                )
                if target:
                    target[0].delete()
                else:
                    self.set_status(404)
                    self.write({"status": 404, "statusText": "User not found"})
                    return
            elif role == "group":
                target = AuthorizedApprovalGroup().find_by(
                    group_id=id, approval_settings_id=approval_settings_id
                )
                if target:
                    target[0].delete()
                else:
                    self.set_status(404)
                    self.write({"status": 404, "statusText": "Group not found"})
                    return
            else:
                self.set_status(404)
                self.write({"status": 404, "statusText": "Record not found"})
                return
        else:
            targets = AuthorizedApprovalGroup().find_by(
                approval_settings_id=approval_settings_id
            ) + AuthorizedApprovalUser().find_by(
                approval_settings_id=approval_settings_id
            )
            for target in targets:
                target.delete()

        Base.session.commit()
        authorized_responders = (
            approval_settings.authorized_approval_groups
            + approval_settings.authorized_approval_users
        )
        self.write({"data": authorized_responders})


class ApiAuthorizedRespondersController(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def initialize(self, loop):
        super(ApiAuthorizedRespondersController, self).initialize(loop)

    def get(self, approval_settings_id):
        q = self.get_argument("q", None)
        current_user = self.get_current_user()
        organization = current_user.organization

        approval_settings = ApprovalSettings.find(approval_settings_id)

        if not approval_settings:
            self.write({"data": []})
            return

        authorized_responders = (
            approval_settings.authorized_approval_groups
            + approval_settings.authorized_approval_users
        )
        data = authorized_responders

        _available_users = [
            u
            for u in organization.users
            if not u in approval_settings.authorized_approval_users
        ]

        _available_groups = [
            g
            for g in organization.groups
            if not g in approval_settings.authorized_approval_groups
        ]
        if q:
            available_users = [
                u
                for u in _available_users
                if q.lower() in u.email.lower() or q in u.name.lower()
            ]

            available_groups = [
                g for g in _available_groups if q.lower() in g.name.lower()
            ]

            self.write({"data": available_users + available_groups})
        else:
            self.write({"data": data})

    def post(self, approval_settings_id):
        _id = json_decode(self.request.body).get("id")
        approval_settings = ApprovalSettings.find(approval_settings_id)

        if not approval_settings:
            self.set_status(422)
            self.write({"message": "Unable to create"})
            return

        role, id = _id.split("-")
        if role == "user":
            try:
                AuthorizedApprovalUser.create(
                    user_id=id, approval_settings_id=approval_settings_id
                )
            except Exception as e:
                Base.session.rollback()
                self.set_status(422)
                self.write({"message": "User not found"})
                return

        elif role == "group":
            try:
                AuthorizedApprovalGroup.create(
                    group_id=id, approval_settings_id=approval_settings_id
                )
            except Exception as e:
                Base.session.rollback()
                self.set_status(422)
                self.write({"message": "Group not found"})
                return
        else:
            self.set_status(422)
            self.write({"message": "Unable to create"})
            return

        Base.session.commit()
        authorized_responders = (
            approval_settings.authorized_approval_groups
            + approval_settings.authorized_approval_users
        )

        self.write({"data": authorized_responders})

    def delete(self, approval_settings_id):
        _id = self.get_argument("id", None)
        approval_settings = ApprovalSettings.find(approval_settings_id)

        if not approval_settings:
            self.set_status(422)
            self.write({"message": "Unable to delete"})
            return

        if _id:
            role, id = _id.split("-")
            if role == "user":
                target = AuthorizedApprovalUser().find_by(
                    user_id=id, approval_settings_id=approval_settings_id
                )
                if target:
                    target[0].delete()
                else:
                    self.set_status(404)
                    self.write({"message": "User not found"})
                    return
            elif role == "group":
                target = AuthorizedApprovalGroup().find_by(
                    group_id=id, approval_settings_id=approval_settings_id
                )
                if target:
                    target[0].delete()
                else:
                    self.set_status(404)
                    self.write({"message": "Group not found"})
                    return
            else:
                self.set_status(404)
                self.write({"message": "Record not found"})
                return
        else:
            targets = AuthorizedApprovalGroup().find_by(
                approval_settings_id=approval_settings_id
            ) + AuthorizedApprovalUser().find_by(
                approval_settings_id=approval_settings_id
            )
            for target in targets:
                target.delete()

        Base.session.commit()
        authorized_responders = (
            approval_settings.authorized_approval_groups
            + approval_settings.authorized_approval_users
        )
        self.write({"data": authorized_responders})
