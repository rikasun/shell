import tornado.web

from shell.models import Base, Program, ApprovalSettings
from shell.controllers.v2 import BaseMixin

from shell.utils import json_decode


def routes(**kwargs):
    return [
        (r"/api/approval_settings", ApprovalsSettingsHandler, kwargs),
        (r"/api/approval_settings/(\d+)", ApprovalSettingsHandler, kwargs),
    ]


class ApprovalsSettingsHandler(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def initialize(self, loop):
        super(ApprovalsSettingsHandler, self).initialize(loop)

    @tornado.web.authenticated
    def get(self):
        programs = Program.all()
        program_approval_settings = programs
        access_approval_settings = self._get_approval_settings_from_prompts()

        clean_program_approval_settings = [
            {
                "id": program.approval_settings.id,
                "name": program.name,
            }
            for program in program_approval_settings
        ]

        clean_access_approval_settings = [
            {
                "id": approval.id,
                "name": approval.prompt,
            }
            for approval in access_approval_settings
        ]

        self.write(
            {
                "program_approval_settings": clean_program_approval_settings,
                "access_approval_settings": clean_access_approval_settings,
            }
        )

    @tornado.web.authenticated
    def post(self):
        current_user = self.get_current_user()
        data = json_decode(self.request.body)

        try:
            program = Program.create(
                name=data.get("name", None),
                path=data.get("path", None),
                creator=current_user,
            )
            approval_settings = ApprovalSettings.create(program_id=program.id)
        except Exception as e:
            Base.session.rollback()
            self.set_status(422)
            self.write({"status": 422, "reason": e.args[0]})
            return

        self.write(
            {
                "data": {
                    "program": program,
                    "approval_setting": approval_settings,
                }
            }
        )


class ApprovalSettingsHandler(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def initialize(self, loop):
        super(ApprovalSettingsHandler, self).initialize(loop)

    @tornado.web.authenticated
    def get(self, id):
        try:
            approval_settings = ApprovalSettings.find_or_fail(id)
            program = approval_settings.program
        except Exception as e:
            raise tornado.web.HTTPError(404, str(e))

        self.write(
            {"data": {"program": program, "approval_settings": approval_settings}}
        )

    @tornado.web.authenticated
    def patch(self, id):
        data = json_decode(self.request.body)
        try:
            approval_settings = ApprovalSettings.find_or_fail(id)
        except Exception as e:
            raise tornado.web.HTTPError(404, str(e))

        if approval_settings.program and data.get("name", None):
            approval_settings.program.name = data.get("name", None)
            del data["name"]

        try:
            approval_settings.update(**data)
        except Exception as e:
            self.set_status(422)
            self.write({"status": 422, "reason": e.args[0]})
            return

        self.write({"data": {"approval_settings": approval_settings}})

    @tornado.web.authenticated
    def delete(self, approval_settings_id):
        try:
            approval_settings = ApprovalSettings.find_or_fail(approval_settings_id)
            program = approval_settings.program

            if not program:
                self.set_status(404)
                return

            program.delete()
            Base.session.commit()
            self.set_status(204)
            self.finish()
        except Exception as e:
            self.set_status(422)
            self.write({"status": 422, "reason": e.args[0]})
            return
