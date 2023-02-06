from sqlalchemy import Column, ForeignKey, Integer
from shell.models.base import Base


class AuthorizedApprovalUser(Base):
    __table_args__ = {"extend_existing": True}
    user_id = Column(Integer, ForeignKey("user.id"))
    approval_settings_id = Column(Integer, ForeignKey("approval_settings.id"))
