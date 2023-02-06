import requests
from shell.models.base import Base
from sqlalchemy import Column, String, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship, reconstructor
import github
import hvac
import os


class CasedShell(Base):
    __tablename__ = "casedshell"

    name = Column("name", String(300))
    hostname = Column("hostname", String(1000))
    organization_id = Column(Integer, ForeignKey("organization.id"))
    ca_enabled = Column(Boolean, unique=False, server_default="true")
    reason_required = Column(Boolean, default=False, server_default="false")
    record_output = Column(Boolean, default=False, server_default="false")
    gh_app_id = Column(Integer)
    gh_app_url = Column(String(300))

    organization = relationship("Organization", back_populates="casedshells")

    vault = hvac.Client(
        url=os.getenv("VAULT_ADDR", "http://localhost:8200"),
        token=os.getenv("VAULT_TOKEN", "dev"),
    )

    @reconstructor
    def init_on_load(self):
        self._github = None

    def github_client(self):
        if self._github:
            return self._github

        if self.gh_app_id:
            app_private_key = self.github_app_key()
            if app_private_key:
                self._github = github.GithubIntegration(self.gh_app_id, app_private_key)

        if self._github:
            return self._github

    # list installation connected repositories
    # https://docs.github.com/en/rest/apps/installations#list-repositories-accessible-to-the-app-installation
    def github_repos(self):
        token = self.get_access_token()

        if not token:
            return []
        headers = {
            "Authorization": "Bearer {}".format(token),
            "Accept": "application/vnd.github+json",
        }

        response = requests.get(
            "https://api.github.com/installation/repositories",
            headers=headers,
            timeout=20,
        )

        return [r.get("full_name") for r in response.json().get("repositories")]

    # https://github.com/coveord/PyGithub/blob/3ba6e765e96c2e59643a88bc35d4ec27f7785ad6/github/GithubIntegration.py#L48
    def get_access_token(self):
        if not self.github_client():
            return None

        installations = self.github_client().get_installations()
        if installations and installations.totalCount > 0:
            installation_id = installations[0].id
            token = self.github_client().get_access_token(installation_id).token

            return token

    def vault_path(self):
        return "{}/{}".format(self.__class__.__tablename__, self.id)

    def github_app_vault_path(self):
        return "{}/github_app/{}".format(self.vault_path(), self.gh_app_id)

    def store_github_app_key(self, pem):
        if self.gh_app_id:
            return self.__class__.vault.secrets.kv.v2.create_or_update_secret(
                path=self.github_app_vault_path(),
                secret=dict(pem=pem),
            )
        else:
            raise ValueError("No github app id")

    def delete_github_app(self):
        if self.gh_app_id:
            self.__class__.vault.secrets.kv.v2.delete_metadata_and_all_versions(
                path=self.github_app_vault_path(),
            )
            self.gh_app_id = None
            self.gh_app_url = None
            return self.save()
        else:
            raise ValueError("No github app id")

    # https://hvac.readthedocs.io/en/stable/overview.html#kv-secrets-engine-version-2
    def github_app_key(self):
        if self.gh_app_id:
            response = self.__class__.vault.secrets.kv.v2.read_secret_version(
                path=self.github_app_vault_path(),
            )
            return response["data"]["data"]["pem"]

        else:
            raise ValueError("No github app id")
