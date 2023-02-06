from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, ARRAY, Table
from sqlalchemy.orm import relationship

from shell.models.base import Base


_authorized_approval_group = Table(
    "authorized_approval_group",
    Base.metadata,
    Column("group_id", ForeignKey("group.id")),
    Column("approval_settings_id", ForeignKey("approval_settings.id")),
)

_authorized_approval_user = Table(
    "authorized_approval_user",
    Base.metadata,
    Column("user_id", ForeignKey("user.id")),
    Column("approval_settings_id", ForeignKey("approval_settings.id")),
)


class ApprovalSettings(Base):
    program_id = Column(Integer, ForeignKey("program.id"))
    prompt = Column(String)

    reason_required = Column(Boolean, default=True)
    self_approval = Column(Boolean, default=True)
    peer_approval = Column(Boolean, default=False)

    approval_duration = Column(Integer, default=0)
    approval_timeout = Column(Integer, default=10)
    deny_on_unreachable = Column(Boolean, default=True)

    subcommands = Column(ARRAY(String), server_default="{}")
    custom_commands = Column(ARRAY(String), server_default="{}")
    ignore_list = Column(ARRAY(String), server_default="{}")

    authorized_approval_groups = relationship(
        "Group", secondary=_authorized_approval_group
    )
    authorized_approval_users = relationship(
        "User", secondary=_authorized_approval_user
    )

    program = relationship("Program", back_populates="approval_settings")
