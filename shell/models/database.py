from sqlalchemy import Column, Text, JSON
from shell.models.base import Base


class Database(Base):
    __tablename__ = "database"
    name = Column(Text, unique=True)
    host = Column(Text)
    port = Column(Text)
    label = Column(Text)
    username = Column(Text)
    metadata_ = Column("metadata", JSON, default={})
