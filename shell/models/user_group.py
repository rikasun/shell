from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship


from shell.models.base import Base


class UserGroup(Base):
    user_id = Column(Integer, ForeignKey("user.id"))
    group_id = Column(Integer, ForeignKey("group.id"))

    group_user = relationship("User", back_populates="user_group")
    user_group = relationship("Group", back_populates="group_user")
