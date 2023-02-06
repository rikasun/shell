import tornado

from shell.controllers.v2 import BaseMixin
from shell.models import CertificateAuthority


class PubkeyController(BaseMixin, tornado.web.RequestHandler):
    def initialize(self, loop, key):
        super(PubkeyController, self).initialize(loop)
        self.key = key

    def get(self):
        certificate_authority = CertificateAuthority.primary()
        principal = CertificateAuthority.principals("nouser")[1]
        public_key = certificate_authority.public_key_data()
        self.set_header("Content-Type", "text/plain")
        self.write(f'cert-authority,principals="{principal}" {public_key}')
