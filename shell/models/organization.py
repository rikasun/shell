from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship, validates
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import relationship


from shell.models.base import Base
from shell.models.casedshell import CasedShell
from shell.models.group import Group


class Organization(Base):
    __repr_attrs__ = ["name"]

    name = Column(String(1000), unique=True)
    logo_image_url = Column(String(300))
    sso_id = Column(String(100), unique=True)

    users = relationship("User", back_populates="organization")
    groups = relationship("Group", back_populates="organization", lazy="dynamic")
    runbooks = relationship("Runbook", back_populates="organization")
    casedshells = relationship(CasedShell, back_populates="organization")
    snippets = relationship("Snippet", back_populates="organization")

    # returns nested list e.g.[[Program #1, Program #2], [Program #3], [], [], ...]
    programs = association_proxy("users", "programs_created")
    # returns nested list e.g.[[Approval #1, Approval #2], [Approval #3], [], [], ...]
    approvals = association_proxy("users", "approvals_requested")
    certificate_authentication = Column(Boolean, default=True)

    @validates("name")
    def validate_name_uniqness(self, key, value):
        return value

    def find_or_create_groups_from_group_names(self, group_names):
        if not group_names:
            return []
        groups = []
        for group_name in group_names:
            group = self.groups.where(Group.scim_group_id == group_name).first()
            if not group:
                group = Group.create(
                    organization_id=self.id,
                    name=group_name,
                    scim_group_id=group_name,
                )
            groups.append(group)
        return groups
