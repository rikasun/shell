from sqlalchemy.orm import Session
from sqlalchemy import MetaData

from shell.engine import engine
from shell.models import base
from shell.models.base import Base

from shell.models import (
    Organization,
    User,
    Program,
    Group,
    UserGroup,
    ApprovalSettings,
    Runbook,
    Block,
    ApprovalSettings,
    CertificateAuthority,
    Group,
    GroupAccess,
    Program,
    User,
    Organization,
    Snippet,
    CasedShell,
    APIProvider,
)


meta = MetaData()
session = Session(engine)


def create_cased_authorized_keys():
    ca = CertificateAuthority.primary()
    user, org, shell = CertificateAuthority.principals("admin@cased.dev")
    with open("/tmp/authorized_keys", "w") as fp:
        fp.write(f'cert-authority,principals="{shell}" {ca.public_key_data()}')


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    organization = Organization.where(name="Cased2022").first() or Organization.create(
        name="Cased2022",
        logo_image_url="https://avatars.githubusercontent.com/u/13429108?s=200&v=4",
    )

    user = User.where(email="admin@cased.dev").first() or User.create(
        organization_id=organization.id,
        email="admin@cased.dev",
        name="Admin User",
        admin=True,
    )

    user.save_password("casedopensource2023")

    user2 = User.where(email="developer@cased.dev").first() or User.create(
        organization_id=organization.id,
        email="developer@cased.dev",
        name="Developer User",
        admin=False,
    )

    user2.save_password("casedopensource2023")

    user3 = User.where(email="user@cased.dev").first() or User.create(
        organization_id=organization.id,
        email="user@cased.dev",
        name="user user",
        admin=False,
    )

    user3.save_password("casedopensource2023")

    group1 = Group.where(
        organization_id=organization.id, name="Engineering Group"
    ).first() or Group.create(organization_id=organization.id, name="Engineering Group")

    group2 = Group.where(
        organization_id=organization.id, name="Customer support"
    ).first() or Group.create(organization_id=organization.id, name="Customer support")

    group3 = Group.where(
        organization_id=organization.id, name="DevOps"
    ).first() or Group.create(organization_id=organization.id, name="DevOps")

    UserGroup.where(user_id=user2.id, group_id=group1.id).first() or UserGroup.create(
        user_id=user2.id, group_id=group1.id
    )

    UserGroup.where(user_id=user.id, group_id=group1.id).first() or UserGroup.create(
        user_id=user.id, group_id=group1.id
    )

    UserGroup.where(user_id=user3.id, group_id=group2.id).first() or UserGroup.create(
        user_id=user3.id, group_id=group2.id
    )

    program = Program.where(
        creator=User.find(1), path="rails", name="rails"
    ).first() or Program.create(creator=User.find(1), path="rails", name="rails")

    approval_setting = ApprovalSettings.where(
        program=program, peer_approval=True
    ).first() or ApprovalSettings.create(program=program, peer_approval=True)
    runbook = Runbook.where(
        name="Get user data dump",
        description="Pulls data from an API and packages it up into a zip",
    ).first() or Runbook.create(
        name="Get user data dump",
        description="Pulls data from an API and packages it up into a zip",
        organization_id=organization.id,
    )
    APIProvider.where(api_name="JSON Placeholder").first() or APIProvider.create(
        api_name="JSON Placeholder", base_url="https://jsonplaceholder.typicode.com"
    )
    Block.where(block_type="rest", name="JSON").first() or Block.create(
        block_type="rest",
        sort_order=1,
        runbook_id=runbook.id,
        data={
            "api_path": "/users",
            "api_provider_id": APIProvider.first().id,
            "headers": [],
            "http_method": "get",
            "query_parameters": [],
        },
        name="JSON",
    )
    Block.where(block_type="shell", name="shell").first() or Block.create(
        block_type="shell",
        sort_order=2,
        runbook_id=runbook.id,
        data={
            "command": "echo {JSON} > json.txt;cat json.txt;gzip -f json.txt",
            "prompt": "demo-bastion",
        },
        name="shell",
    )

    casedshell = CasedShell.where(hostname="cased.dev").first() or CasedShell.create(
        organization=organization, hostname="cased.dev", name="dev-shell"
    )

    Snippet.where(
        name="List system users", organization_id=organization.id
    ).first() or Snippet.create(
        name="List system users", organization_id=organization.id, code="users"
    )
    Snippet.where(
        name="List system users", organization_id=organization.id
    ).first() or Snippet.create(
        name="List system users", organization_id=organization.id, code="users"
    )

    # Give SSO users permissions by default
    _ = GroupAccess.find("Local") or GroupAccess.create(
        name="Local", labels={"environment": "development"}
    )
    _ = GroupAccess.find("Github") or GroupAccess.create(
        name="Github", labels={"environment": "development"}
    )
    _ = GroupAccess.find("Google") or GroupAccess.create(
        name="Google", labels={"environment": "development"}
    )
    _ = GroupAccess.find("Okta") or GroupAccess.create(
        name="Okta", labels={"environment": "development"}
    )

    create_cased_authorized_keys()

    print("data seeded")
