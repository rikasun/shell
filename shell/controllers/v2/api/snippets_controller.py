import logging
import tornado
import json
import base64
import pathlib
import yaml
from github import Github

from shell.controllers.v2 import BaseMixin
from shell.models import Organization, Snippet
from shell.models.base import Base

from shell.utils import json_decode

gh_snippets_data = {"snippets": None, "categories": None}


class APISnippetsController(BaseMixin, tornado.web.RequestHandler):
    def initialize(self, loop):
        super(APISnippetsController, self).initialize(loop)

    def parse_yml_content(self, yml):
        try:
            decoded = base64.b64decode(yml)
        except Exception as e:
            logging.info(e)
            return

        content = yaml.safe_load(decoded)
        return content

    def get_repository_contents(self, repos):
        snippets = []
        categories = set()
        if gh_snippets_data.get("snippets") and gh_snippets_data.get("categories"):
            return gh_snippets_data.get("snippets"), gh_snippets_data.get("categories")

        current_casedshell = self.current_casedshell()
        gh_token = current_casedshell.get_access_token()

        if not gh_token:
            return snippets, categories

        g = Github(gh_token)

        for repo in repos:
            try:
                repository = g.get_repo(repo)
            except Exception as e:
                logging.info(e)
                continue

            contents = repository.get_contents("")
            while contents:
                file_content = contents.pop(0)
                if file_content.type == "dir":
                    contents.extend(repository.get_contents(file_content.path))
                else:
                    # https://docs.github.com/en/rest/repos/contents#get-repository-content
                    path = file_content.path
                    extension = pathlib.Path(path).suffix
                    if extension in [".yml", ".yaml"]:
                        content = self.parse_yml_content(file_content.content)
                        if not content or (not content.get("command", None)):
                            continue

                        content.update({"path": file_content.path})

                        snippets.append(content)

                        if cat := content.get("categories"):
                            categories.update(c for c in cat)

        if not gh_snippets_data.get("snippets"):
            gh_snippets_data.update(snippets=snippets)

        if not gh_snippets_data.get("categories"):
            gh_snippets_data.update(categories=list(categories))

        return snippets, list(categories)

    def get_snippets_by_category(self, snippets_content, category):
        snippets = []
        for snippet_content in snippets_content:
            snippet_categories = snippet_content.get("categories", None)
            if category == "uncategorized" and not snippet_categories:
                snippets.append(snippet_content)
            elif category.lower() in [c.lower() for c in snippet_categories]:
                snippets.append(snippet_content)
            else:
                pass

        return snippets

    def get_snippets_from_search(self, snippets_content, q):
        snippets = []
        for snippet_content in snippets_content:
            if q.lower() in json.dumps(snippet_content).lower():
                snippets.append(snippet_content)

        return snippets

    @tornado.web.authenticated
    def get(self):
        category = self.get_argument("category", None)
        q = self.get_argument("q", None)
        snippets_repos_list = self.current_casedshell().github_repos()

        if len(snippets_repos_list) == 0:
            self.write({"snippets": [], "categories": []})
            return

        snippets_content, categories = self.get_repository_contents(snippets_repos_list)
        if category:
            snippets_content = self.get_snippets_by_category(snippets_content, category)

        if q:
            snippets_content = self.get_snippets_from_search(snippets_content, q)

        self.write({"snippets": snippets_content, "categories": categories})

    @tornado.web.authenticated
    def post(self):
        data = json_decode(self.request.body)
        name = data["name"]
        code = data["code"]

        current_organization = Organization.all()[0]

        try:
            Snippet.create(
                name=name, code=code, organization_id=current_organization.id
            )
        except Exception as e:
            self.set_status(422)
            self.write({"status": 422, "reason": e.args[0]})
            Base.session.rollback()
            return

        self.write({"status": 201})
