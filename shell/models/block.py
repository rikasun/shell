from shell.models.base import Base
from sqlalchemy import Column, Text, JSON, Integer, ForeignKey
from sqlalchemy.orm import relationship


class Block(Base):
    block_type = Column(Text)
    sort_order = Column(Text)
    runbook_id = Column(Integer, ForeignKey("runbook.id"))
    runbook = relationship("Runbook", back_populates="blocks")
    data = Column(JSON)
    name = Column(Text)
