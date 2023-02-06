from shell.models.base import Base
from sqlalchemy import Column, Text, JSON, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class Runbook(Base):
    name = Column(Text, unique=True)
    description = Column(Text)
    organization_id = Column(Integer, ForeignKey("organization.id"))
    organization = relationship("Organization", back_populates="runbooks")
    blocks = relationship("Block", back_populates="runbook")
    last_run = Column(DateTime)

    def get_blocks(self):
        return sorted(self.blocks, key=lambda block: block.id)

    def mark_as_run(self):
        self.last_run = func.now()
        self.save()
