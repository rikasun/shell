import time
import uuid
import re
import json
import hashlib
import logging
import os
from json.decoder import JSONDecodeError
from shell.utils import get_shell_host_file, to_sentence, to_slug
from shell.models import ApprovalSettings, CasedShell
from shell.engine import engine


class JumpManifest:
    def __init__(self, datafile):
        self.datafile = datafile

        try:
            with open(datafile) as f:
                self._load_file()
        except JSONDecodeError:
            print("Empty file")
        except FileNotFoundError:
            print("File does not exist")

    def _load_file(self):
        with open(self.datafile) as f:
            return json.load(f)

    def prompts(self):
        data = self._load_file()
        return data.get("prompts", [])


class PromptContext:
    def __init__(self, **kwargs):
        self.session_id = kwargs.get("session_id")
        self.reason_required = kwargs.get("reason_required")
        self.key_stored = kwargs.get("key_stored")
        self.ssh_passphrase = kwargs.get("ssh_passphrase")
        self.certificate_authentication = kwargs.get("certificate_authentication")
        self.one_click_auth = kwargs.get("one_click_auth", False)
        default_principals = []
        if os.getenv("CASED_LOCAL", False):
            default_principals.append("ops-group")
        # TODO load this from the API
        self.authenticated_principals = kwargs.get(
            "authenticated_principals", default_principals
        )
        self.need_access = kwargs.get("need_access", False)


class Prompt:
    approval_settings_cache = {}

    def __init__(self, object, **kwargs):
        self.hostname = object.get("hostname", None)
        self.port = object.get("port", "22")
        self.username = object.get(
            "username", os.getenv("CASED_SHELL_SSH_USERNAME", None)
        )
        self.ip_address = object.get("ipAddress", None)
        self.name = object.get("name", self.hostname or self.ip_address)
        self.description = object.get("description", None)
        self.jump_command = object.get("jumpCommand", None)
        self.shell_command = object.get("shellCommand", None)
        self.pre_download_command = object.get("preDownloadCommand", None)

        self.kind = object.get("kind", None)
        self.provider = object.get("provider", None)
        self.labels = object.get("labels", {})
        self.annotations = object.get("annotations", {})
        self.principals = object.get("principals", [])
        self.featured = object.get("featured", False)
        self.prompt_for_key = object.get("promptForKey", False)
        self.prompt_for_username = object.get("promptForUsername", False)
        self.proxy_jump_selector = object.get("proxyJumpSelector", {})
        self.close_terminal_on_exit = object.get("closeTerminalOnExit", True)
        self.context = PromptContext(**kwargs)
        self.find_or_create_approval_settings()

    def find_or_create_approval_settings(self):
        if engine is not None:
            for key, value in self.labels.items():
                prompt = json.dumps({key: value})
                if not prompt in Prompt.approval_settings_cache:
                    _approval_setting = ApprovalSettings().find_by(prompt=prompt)
                    if len(_approval_setting) == 0:
                        _approval_setting = ApprovalSettings.create(
                            prompt=prompt, reason_required=False
                        )
                    Prompt.approval_settings_cache[prompt] = _approval_setting

    @classmethod
    def list(cls, **kwargs):
        return [
            cls(prompt, **kwargs)
            for prompt in JumpManifest(get_shell_host_file()).prompts()
        ]

    @classmethod
    def from_hostnames(cls, hostnames, **kwargs):
        return [cls(dict(hostname=hostname), **kwargs) for hostname in hostnames]

    @classmethod
    def from_hostnames_and_descriptions(cls, hostnames_and_descriptions, **kwargs):
        return [
            cls(dict(hostname=hostname, description=description), **kwargs)
            for hostname, description in hostnames_and_descriptions.items()
        ]

    # we can refer to prompt by their 'slug' as there's built in handling for detecting duplicates in this method.
    @classmethod
    def get(cls, slug, **kwargs):
        if get_shell_host_file() == None:
            hostname_or_ip = slug.replace("-", ".")
            return Prompt.from_hostnames([hostname_or_ip], **kwargs)[0]
        else:
            matches = [prompt for prompt in cls.list(**kwargs) if prompt.slug() == slug]
            if len(matches) == 0:
                return None
            elif len(matches) == 1:
                return matches[0]
            else:
                raise Exception("{} matches for slug {}".format(len(matches), slug))

    def path(self):
        return "/prompt/{}".format(self.slug())

    def v2_path(self):
        return "/v2/prompt/{}".format(self.slug())

    def core_info(self):
        dictionary = {
            "path": self.path(),
            "needs_more_info": self.needs_more_info(),
            "session_id": self.context.session_id,
            "hostname": self.ip_address or self.hostname,
            "port": self.port,
            "close_terminal_on_exit": self.close_terminal_on_exit,
        }
        if self.username:
            dictionary["username"] = self.username

        if self.context.certificate_authentication:
            dictionary["certificate_authentication"] = True

        if self.initial_command():
            dictionary["initial_command"] = self.initial_command()

        if self.proxy_jump_prompt():
            dictionary["proxy_jump"] = self.proxy_jump_string()

        if self.pre_download_command:
            dictionary["pre_download_command"] = self.pre_download_command

        return dictionary

    def digest(self):
        unique = "{}@{}:{} {}".format(
            self.username, self.hostname, self.port, self.initial_command()
        )
        return hashlib.sha1(unique.encode("utf-8")).hexdigest()[0:8]

    def slug(self):
        bare_slug = to_slug(self.name)
        if get_shell_host_file() == None:
            return bare_slug
        matches = [
            prompt for prompt in self.__class__.list() if prompt.name == self.name
        ]
        if len(matches) > 1:
            return to_slug("{}-{}".format(self.name, self.digest()))
        else:
            return bare_slug

    def legacy_hostname_with_command(self):
        command = self.initial_command()
        ip_or_hostname = self.ip_address or self.hostname
        if command is not None:
            return "{} {}".format(ip_or_hostname, command)
        else:
            return ip_or_hostname

    def initial_command(self):
        if self.jump_command:
            if not self.jump_command.startswith("exec"):
                self.jump_command = "exec " + self.jump_command

            if self.shell_command:
                return "exec /bin/sh -c ':; {} {}'".format(
                    self.jump_command, self.shell_command
                )
            else:
                return self.jump_command
        else:
            if self.shell_command:
                return self.shell_command
            else:
                return None

    def needs_more_info(self):
        if self.context.session_id is None or self.context.session_id == "":
            raise Exception("Need context")

        if self.context.one_click_auth:
            if (
                self.reason_required_from_approval_settings()
                or self.needs_authentication()
            ):
                return True

        return False

    def needs_authentication(self):
        if self.context.session_id is None or self.context.session_id == "":
            raise Exception("Need context")

        if self.prompt_for_key:
            return True

        if self.username is None or self.prompt_for_username:
            return True

        if not self.context.certificate_authentication:
            return True

        return False

    def authorized_for_authenticated_principals(self):
        return len(self.authorized_princpals()) > 0

    def authorized_princpals(self):
        known_good_principals = self.principals or []
        authenticated_principals = self.context.authenticated_principals or []
        return list(set(authenticated_principals) & set(known_good_principals))

    def authorization_explanation(self):
        if (
            self.context.certificate_authentication
            and self.authorized_for_authenticated_principals()
        ):
            return "Host configured to authorize certificates with the {} {}.".format(
                to_sentence(self.authorized_princpals(), "or"),
                "principals" if len(self.authorized_princpals()) > 1 else "princpal",
            )
        else:
            return ""

    def proxy_jump_prompt(self):
        if self.proxy_jump_selector == {}:
            return None
        else:
            for prompt in Prompt.list():
                matching_labels = []
                for key, val in self.proxy_jump_selector.items():
                    if prompt.labels.get(key) == val:
                        matching_labels.append(key)

                if len(matching_labels) == len(self.proxy_jump_selector.items()):
                    prompt.context = self.context
                    if not prompt.needs_authentication():
                        return prompt

        return None

    def proxy_jump_string(self):
        jump = self.proxy_jump_prompt()
        if jump is not None:
            return "{}@{}:{}".format(jump.username, jump.hostname, jump.port)

    def reason_required_from_approval_settings(self):
        if engine is not None:
            casedshell = CasedShell.first()
            if casedshell and casedshell.reason_required:
                return True

            for key, value in self.labels.items():
                prompt = json.dumps({key: value})
                _approval_setting = ApprovalSettings().find_by(prompt=prompt)
                if len(_approval_setting) > 0:
                    reason_required = _approval_setting[0].reason_required
                    if reason_required:
                        return True

        return False

    def approval_required_from_approval_settings(self):
        if engine is not None:
            prompt_labels = self.labels
            if prompt_labels:
                for item in prompt_labels.items():
                    key = item[0]
                    value = item[1]
                    label = json.dumps({key: value})
                    _approval_settings = ApprovalSettings().find_by(prompt=label)
                    if len(_approval_settings) == 0:
                        pass
                    else:
                        approval_settings = _approval_settings[0]
                        if approval_settings.peer_approval is True:
                            return True
                        else:
                            pass

        return False
