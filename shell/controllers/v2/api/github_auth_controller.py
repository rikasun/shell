import tornado
import logging
import requests

from shell.controllers.v2 import BaseMixin


class APIGitHubAuthController(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def initialize(self, loop):
        super(APIGitHubAuthController, self).initialize(loop)

    @tornado.web.authenticated
    def get(self):
        code = self.get_argument("code", None)
        if not code:
            logging.info("no code provided")
            self.set_status(403)
            return

        state = self.get_argument("state", None)  # for now
        ## TODO validate against session
        if not state:
            logging.info("no state provided")
            self.set_status(403)
            return

        # request the app credentials from github
        url = "https://api.github.com/app-manifests/{}/conversions".format(code)

        headers = {"Accept": "application/vnd.github+json"}
        res = requests.post(url, None, headers=headers)
        ret_data = res.json()

        if ret_data.get("message", None) == "Not Found":
            self.write({"connected": False})
            return

        app_id = ret_data.get("id")
        app_private_key = ret_data.get("pem")
        app_url = ret_data.get("html_url")

        current_casedshell = self.current_casedshell()
        current_casedshell.gh_app_id = app_id
        current_casedshell.gh_app_url = app_url
        current_casedshell.save()
        current_casedshell.store_github_app_key(app_private_key)

        self.write({"connected": True})
        return

    @tornado.web.authenticated
    def delete(self):
        current_casedshell = self.current_casedshell()
        current_casedshell.delete_github_app()
        self.set_status(204)
        self.finish()
