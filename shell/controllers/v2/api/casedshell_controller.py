import tornado
import re

from shell.models import CertificateAuthority
from shell.controllers.v2 import BaseMixin

from shell.utils import json_decode


class ApiCasedShellController(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def initialize(self, loop):
        super(ApiCasedShellController, self).initialize(loop)

    def _get_gh_repos_count(self):
        count = 0
        if self.current_casedshell().gh_app_url:
            github_client = self.current_casedshell().github_client()
            if github_client:
                # PaginatedList is not JSON serializable
                github_repos = github_client.get_installations()
                count = github_repos.totalCount

        return count

    def get_instance_context(self):
        instruction_text = ""
        certificate_authority = CertificateAuthority.primary()
        principal_name = CertificateAuthority.principals(self.get_current_user())[1]
        public_key = certificate_authority.public_key_data()

        if certificate_authority:
            instruction_text = self._build_text(
                public_key,
                certificate_authority.id(),
                principal_name,
            )

        return dict(
            public_key=public_key,
            principal_name=principal_name,
            certificate_authentication=self._is_certificate_authentication_enabled(),
            organization_name=self.current_organization().name,
            instruction_text=instruction_text,
        )

    def _build_text(self, public_key, ca_id, principal_name):
        base_string = """
        echo "{0}" | sudo tee /etc/ssh/cased_{1}.pub
        echo "TrustedUserCAKeys /etc/ssh/cased_{2}.pub" | sudo tee -a /etc/ssh/sshd_config
        echo "{3}" | sudo tee /etc/ssh/cased_org_principal
        echo "AuthorizedPrincipalsFile /etc/ssh/cased_org_principal" | sudo tee -a /etc/ssh/sshd_config
        sudo systemctl restart sshd""".format(
            public_key, ca_id, ca_id, principal_name
        )

        base_string = re.sub(" +", " ", base_string)
        base_string = base_string.strip().split("\n")
        base_string = ("\n ").join(base_string)
        return base_string

    @tornado.web.authenticated
    def get(self):
        current_casedshell = self.current_casedshell()
        self.write(
            {
                "certificate_authority": CertificateAuthority.primary() is not None,
                "shell": current_casedshell,
                "github_repos": self._get_gh_repos_count(),
                "ssh": self.get_instance_context(),
            }
        )

    @tornado.web.authenticated
    def patch(self):
        current_casedshell = self.current_casedshell()
        casedshell = json_decode(self.request.body)
        reason_required = casedshell.get(
            "reason_required", current_casedshell.reason_required
        )
        record_output = casedshell.get(
            "record_output", current_casedshell.record_output
        )
        ca_enabled = casedshell.get("ca_enabled", current_casedshell.ca_enabled)

        try:
            current_casedshell.update(
                reason_required=reason_required,
                record_output=record_output,
                ca_enabled=ca_enabled,
            )

        except Exception as e:
            self.set_status(422)
            self.write({"status": 422, "reason": e.args[0]})
            return

        self.set_status(200)
        self.write({"status": 200, "casedshell": current_casedshell})
