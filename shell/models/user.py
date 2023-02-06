from passlib.hash import bcrypt
from sqlalchemy import Column, ForeignKey, Integer, String, Boolean
from sqlalchemy import event
from sqlalchemy.orm import relationship
from sqlalchemy.ext.associationproxy import association_proxy

from shell.models.base import Base
from shell.models.organization import Organization
from shell.models.user_group import UserGroup

hasher = bcrypt.using(rounds=13)


class User(Base):
    __repr_attrs__ = ["name", "email", "admin"]

    name = Column(String(1000))
    email = Column(String(1000), unique=True)
    password_digest = Column(String(1000))

    idp_user_id = Column(String(200))
    idp_directory_user_id = Column(String(200))

    admin = Column(Boolean, default=False)
    organization_id = Column(Integer, ForeignKey("organization.id"))

    organization = relationship("Organization", back_populates="users")
    user_group = relationship("UserGroup", back_populates="group_user", lazy="dynamic")
    groups = association_proxy("user_group", "user_group")

    programs_created = relationship("Program", back_populates="creator")
    approvals_requested = relationship(
        "Approval",
        back_populates="requestor",
        foreign_keys="Approval.requestor_id",
        order_by="Approval.created_at",
    )

    @property
    def role(self):
        if self.admin:
            return "admin"
        else:
            return "user"

    @classmethod
    def find_by_validated_access_token(cls, access_token):
        """
        Find a user by an access token that has been validated by the IDP. We
        expect that our access tokens contain an email address validated by the
        IDP.
        """
        if not access_token:
            return None
        if "c_hash" in access_token:
            raise ValueError("Cannot use ID Tokens as Access Tokens.")
        if "email" in access_token:
            return cls.where(email=access_token["email"]).first()
        else:
            return None

    @classmethod
    def find_create_or_update_from_id_token(cls, id_token):
        if not id_token:
            return None
        if "c_hash" not in id_token:
            raise ValueError("Cannot use Access Tokens as ID Token.")
        if "email" in id_token:
            user = cls.where(email=id_token["email"]).first()
            if user:
                if user.idp_user_id != id_token["sub"]:
                    user.update(idp_user_id=id_token["sub"])
            else:
                org = Organization.all()[0]

                # First created user gets blessed as an Admin
                admins = User.where(admin=True).count()

                user = cls.create(
                    admin=(admins == 0),
                    name=id_token["name"],
                    email=id_token["email"],
                    idp_user_id=id_token["sub"],
                    organization=org,
                )
            user.crud_user_groups_from_id_token(id_token)

            return user
        else:
            return None

    def crud_user_groups_from_id_token(self, id_token):
        """
        Requires a token with 'group' and 'federated_claims.connector_id' claims.
        """
        if not id_token:
            return []
        if "c_hash" not in id_token:
            raise ValueError("Cannot use Access Tokens as ID Token.")
        if "groups" in id_token:
            if (
                "federated_claims" in id_token
                and "connector_id" in id_token["federated_claims"]
            ):
                connector_name = id_token["federated_claims"]["connector_id"]

            # prefix each group with the name of the connector
            prefixed_group_names = []
            if connector_name:
                prefixed_group_names = [
                    f"{connector_name} {group}" for group in id_token["groups"]
                ]
                prefixed_group_names += [connector_name]

            # Create the groups
            groups = self.organization.find_or_create_groups_from_group_names(
                prefixed_group_names
            )

            # Add user to groups if not already there
            for group in groups:
                if not UserGroup.where(group_user=self, user_group=group).first():
                    UserGroup.create(group_user=self, user_group=group)

            # Remove user from groups if not in list computed from id_token
            for user_group in self.user_group.all():
                scim_group_id = user_group.user_group.scim_group_id
                if (
                    scim_group_id != ""
                    and scim_group_id.startswith(f"{connector_name} ")
                    and scim_group_id not in prefixed_group_names
                ):
                    user_group.delete()

            return groups
        else:
            return []

    def save_password(self, password):
        self.password_digest = hasher.hash(password)

    def check_password(self, password):
        return hasher.verify(password, self.password_digest)


@event.listens_for(User.admin, "set")
def ensure_not_last_admin(target, value, oldvalue, initiator):
    if oldvalue == True and value == False:
        admin_users = list(filter(lambda u: u.admin == True, target.organization.users))
        if len(admin_users) == 1:
            raise ValueError("Cannot change permission of the last admin.")
