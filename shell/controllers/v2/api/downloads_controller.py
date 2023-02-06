import contextlib
import logging
import tempfile
import tornado
from tornado import iostream

from shell.models import Prompt
from shell.controllers.v2 import BaseMixin
from shell.utils import to_str, json_decode


class APIDownloadsController(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def initialize(self, loop, policy, host_keys_settings):
        super(APIDownloadsController, self).initialize(loop)
        logging.info(self.request)

        self.policy = policy
        self.host_keys_settings = host_keys_settings
        self.ssh_client = self._get_ssh_client()

    def _exec_pre_download_command(
        self, ssh_client, pre_download_command, filepath, filename
    ):
        _, stdout_fd, stderr_fd = ssh_client.exec_command(
            pre_download_command.format(filepath=filepath, filename=filename)
        )
        stdout = stdout_fd.read()
        stderr = stderr_fd.read()
        if len(stdout.splitlines()) > 0:
            return to_str(stdout.splitlines()[0].strip())
        else:
            error = "preDownloadCommand failed"
            try:
                error = 'preDownloadCommand failed. command="{}" stdout="{}" stderr="{}"'.format(
                    pre_download_command,
                    to_str(stdout).strip(),
                    to_str(stderr).strip(),
                )
            except Exception as e:
                logging.error(e)

            self.set_status(400)
            self.write({"reason": error})
            return

    @tornado.web.authenticated
    def post(self):
        token = self.get_secure_cookie("token")
        self.data = json_decode(self.request.body)
        filepath = self.data.get("filepath")
        prompt_slug = self.data.get("promptSlug")
        if not filepath or not prompt_slug:
            self.set_status(400)
            self.write({"reason": "Fields filepath and promptSlug required."})
            return

        prompt = Prompt.get(prompt_slug)
        if not prompt:
            self.set_status(400)
            self.write({"reason": "Prompt not found."})
            return

        filename = filepath.split("/")[-1]

        hostname = prompt.hostname
        port = prompt.port
        username = prompt.username

        pre_download_command = self.data.get("pre_download_command", None)

        with tempfile.TemporaryDirectory() as temp_dir:
            with tempfile.NamedTemporaryFile() as temp_file:

                pkey = self.get_pkey(token, temp_dir)

                args = (hostname, port, username, "", pkey, "")

                with self._ssh_connect_context(
                    args, proxy_jump=self.data.get("proxy_jump", None)
                ) as ssh_client:
                    if pre_download_command:
                        filepath = self._exec_pre_download_command(
                            ssh_client, pre_download_command, filepath, filename
                        )

                    self.set_status(200)
                    self.set_header("Content-Disposition", "attachment")
                    self.set_header("X-Filename", filename)

                    with contextlib.closing(ssh_client.open_sftp()) as download_client:
                        try:
                            download_client.getfo(filepath, temp_file)
                        except IOError as e:
                            self.set_status(400)
                            self.write({"reason": "File not found"})
                            return

                        temp_file.seek(0)

                        chunk_size = 1024 * 1024 * 1  # megabyte
                        while True:
                            chunk = temp_file.read(chunk_size)
                            if not chunk:
                                break
                            try:
                                self.write(chunk)
                                self.flush()
                            except iostream.StreamClosedError:
                                break
                            finally:
                                del chunk

                self.finish()
                return
