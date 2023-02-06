from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.ext.associationproxy import association_proxy

from shell.models.base import Base


class Group(Base):
    __repr_attrs__ = ["name"]
    name = Column(String(300))
    organization_id = Column(Integer, ForeignKey("organization.id"))
    scim_group_id = Column(String(300), unique=True)

    organization = relationship("Organization", back_populates="groups")
    group_user = relationship("UserGroup", back_populates="user_group")
    users = association_proxy("group_user", "group_user")

    @classmethod
    def find_or_create_scim_groups_from_names(cls, names, **kwargs):
        if not names:
            return []
        groups = []
        for group_name in names:
            group = cls.where(scim_group_id=group_name).first()
            if not group:
                group = cls.create(name=group_name, scim_group_id=group_name, **kwargs)
            groups.append(group)
        return groups
