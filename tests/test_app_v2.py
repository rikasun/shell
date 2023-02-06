from sqlalchemy import MetaData
from sqlalchemy.orm import Session


from shell.engine import engine
from shell.models.base import Base
from shell.models import (
    Organization,
    User,
    Program,
    ApprovalSettings,
    Group,
    CasedShell,
)

from tests.test_app import TestV2AppBaseApp, PatchMixin

from mock import patch

meta = MetaData()

session = Session(engine)

Base.metadata.create_all(bind=engine)


class TestV2AppBaseWithSeeds(TestV2AppBaseApp, PatchMixin):
    def setUp(self):
        super().setUp()
        if self.session:
            self.session.rollback()
        self.session = session.begin_nested()

        organization = Organization.create(
            name="Cased2022",
            logo_image_url="https://avatars.githubusercontent.com/u/13429108?s=200&v=4",
        )
        current_user = User.create(
            organization_id=organization.id,
            email="test-admin@cased.com",
            name="admin user",
            admin=True,
        )
        User.create(
            organization_id=organization.id,
            email="test-developer@cased.com",
            name="developer user",
            admin=False,
        )
        Group.create(organization_id=organization.id, name="Engineering Group")
        program = Program.create(creator=User.find(1), path="rails", name="rails")
        ApprovalSettings.create(program=program, peer_approval=True)
        CasedShell.create(
            organization=organization, hostname="cased.dev", name="dev-shell"
        )

        self.patches = [
            patch(
                "shell.controllers.v2.BaseMixin.get_current_user",
                return_value=current_user,
            ),
        ]
        for p in self.patches:
            p.start()

    def tearDown(self):
        super().tearDown()
        for p in self.patches:
            p.stop()

    @classmethod
    def setUpClass(cls):
        PatchMixin.setUpClass()

    @classmethod
    def tearDownClass(cls):
        PatchMixin.tearDownClass()
        for patch in cls.patches:
            patch.stop()
