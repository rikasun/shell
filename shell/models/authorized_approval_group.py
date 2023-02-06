from sqlalchemy import Column, ForeignKey, Integer
from shell.models.base import Base


class AuthorizedApprovalGroup(Base):
    __table_args__ = {"extend_existing": True}
    group_id = Column(Integer, ForeignKey("group.id"))
    approval_settings_id = Column(Integer, ForeignKey("approval_settings.id"))
