import contextlib
import logging
import tempfile
import tornado

from shell.controllers.v2 import BaseMixin


class APIUploadsController(BaseMixin, tornado.web.RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def initialize(self, loop, policy, host_keys_settings):
        super(APIUploadsController, self).initialize(loop)
        logging.info(self.request)

        self.policy = policy
        self.host_keys_settings = host_keys_settings
        self.ssh_client = self._get_ssh_client()

    @tornado.web.authenticated
    def post(self):
        token = self.get_secure_cookie("token")

        _uploaded_files = self.request.files.get("file")
        uploaded_file = _uploaded_files[0]

        filename = uploaded_file.get("filename")
        hostname = self.get_argument("hostname")
        port = self.get_argument("port")
        username = self.get_argument("username")

        # store the file temporarily
        with tempfile.TemporaryDirectory() as temp_dir:
            with tempfile.TemporaryFile() as new_file:
                new_file.write(uploaded_file.body)
                new_file.seek(0)

                pkey = self.get_pkey(token, temp_dir)

                args = (hostname, port, username, "", pkey, "")

                # target directory is the home directory of the user
                if username == "root":
                    target_filename = "/root/{}".format(filename)
                else:
                    target_filename = "/home/{}/{}".format(username, filename)

                with self._ssh_connect_context(
                    args, proxy_jump=self.get_argument("proxy_jump", None)
                ) as ssh_client:
                    with contextlib.closing(ssh_client.open_sftp()) as upload_client:
                        upload_client.putfo(new_file, target_filename)
