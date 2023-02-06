from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.ext.associationproxy import association_proxy

from shell.models.base import Base


class Program(Base):
    __repr_attrs__ = ["name", "path"]

    name = Column(String(1000))
    path = Column(String(1000))
    creator_id = Column(Integer, ForeignKey("user.id"))

    creator = relationship("User", back_populates="programs_created")
    organization = association_proxy("creator", "organization")

    approvals = relationship(
        "Approval", back_populates="program", cascade="all, delete-orphan"
    )
    approval_settings = relationship(
        "ApprovalSettings",
        back_populates="program",
        uselist=False,
        cascade="all, delete-orphan",
    )
