import tornado

from shell.controllers.v2 import BaseMixin
from shell.models import Prompt
from shell.utils import (
    is_privkey_stored,
    get_ssh_passphrase,
)


def routes(**kwargs):
    return [
        (r"/v2/api/prompts", ApiPromptsController, kwargs),
        (r"/v2/api/prompts/([^/]+)", ApiPromptController, kwargs),
    ]


class ApiPromptsController(BaseMixin, tornado.web.RequestHandler):
    def initialize(self, loop):
        super(ApiPromptsController, self).initialize(loop)

    @tornado.web.authenticated
    def get(self):
        prompts = self._get_prompts()
        prompts_data = []
        for prompt in prompts:
            prompts_data.append(self._get_prompt_dict(prompt))

        self.write({"prompts": prompts_data})

    def _get_prompt_dict(self, prompt):
        p_dict = prompt.__dict__
        p_dict.update(
            slug=prompt.slug(),
            certificate_authentication=prompt.context.certificate_authentication,
            session_id=self.session_id,
            needs_more_info=prompt.needs_more_info(),
            needs_authentication=prompt.needs_authentication(),
            authorized_for_authenticated_principals=prompt.authorized_for_authenticated_principals(),
            authorization_explanation=prompt.authorization_explanation(),
            need_access=prompt.context.need_access,
            approval_required=prompt.approval_required_from_approval_settings(),
        )

        del p_dict["context"]
        return p_dict


class ApiPromptController(BaseMixin, tornado.web.RequestHandler):
    def initialize(self, loop):
        super(ApiPromptController, self).initialize(loop)

    @tornado.web.authenticated
    def get(self, slug):
        prompt = Prompt.get(
            slug=slug,
            session_id=self.session_id,
            key_stored=is_privkey_stored(),
            ssh_passphrase=get_ssh_passphrase(),
            certificate_authentication=self._is_certificate_authentication_enabled(),
            one_click_auth=True,
        )
        if prompt:
            self.write_api({"prompt": self._get_prompt_dict(prompt)})
        else:
            self.set_status(404)

    def _get_prompt_dict(self, prompt):
        p_dict = prompt.__dict__
        p_dict.update(
            path=prompt.path(),
            slug=prompt.slug(),
            certificate_authentication=prompt.context.certificate_authentication,
            session_id=self.session_id,
            needs_authentication=prompt.needs_authentication(),
            authorization_explanation=prompt.authorization_explanation(),
            prompt_for_username=prompt.prompt_for_username,
            prompt_for_key=prompt.prompt_for_key,
            key_stored=prompt.context.key_stored,
            ssh_passphrase=prompt.context.ssh_passphrase,
            reason_required=prompt.reason_required_from_approval_settings(),
            needs_more_info=prompt.needs_more_info(),
            approval_required=prompt.approval_required_from_approval_settings(),
        )
        del p_dict["context"]
        return p_dict
