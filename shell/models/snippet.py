from sqlalchemy import Column, ForeignKey, Integer, Text, String
from sqlalchemy.orm import relationship

from shell.models.base import Base


class Snippet(Base):
    __repr_attrs__ = ["name", "code"]

    name = Column(String)
    code = Column(Text)
    organization_id = Column(Integer, ForeignKey("organization.id"))

    organization = relationship("Organization", back_populates="snippets")
