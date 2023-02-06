import datetime
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, func, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_method

from shell.models.base import Base

from shell.utils import get_current_time


class LogEntry(Base):
    start_time = Column(DateTime, server_default=func.now())
    end_time = Column(DateTime)

    creator_id = Column(Integer, ForeignKey("user.id"))

    program_id = Column(Integer, ForeignKey("program.id"))
    prompt = Column(String)
    runbook_id = Column(Integer, ForeignKey("runbook.id"))

    ip_address = Column(String(30))
    reason = Column(String(1000))
    metadata_ = Column("metadata", JSON, default={})

    creator = relationship("User")
    organization = association_proxy("creator", "organization")
    program = relationship("Program")
    runbook = relationship("Runbook")
    approval = relationship("Approval", back_populates="log_entry", uselist=False)

    def is_runbook_run(self):
        if self.runbook_id:
            return True
        else:
            return False

    def log_type(self):
        if self.runbook_id:
            return "Runbook run"
        else:
            return "Session"

    @hybrid_method
    def end_session(self):
        self.update(end_time=get_current_time())

    @classmethod
    def user_sessions(cls, user_id):
        return cls.where(creator_id=user_id).order_by(LogEntry.start_time.desc())

    @classmethod
    def group_sessions(cls, group):
        sessions = cls.all()
        group_sessions = []
        group_users = group.users
        for session in sessions:
            if session.creator.email in [u.email for u in group_users]:
                group_sessions.append(session)

        return sorted(group_sessions, key=lambda i: i.start_time, reverse=True)

    @classmethod
    def sessions_count(cls, days_til_today):
        sessions = cls.all()
        count = 0
        for session in sessions:
            if session.start_time > get_current_time() - datetime.timedelta(
                days=days_til_today
            ):
                count = count + 1

        return count

    @classmethod
    def users_count(cls, days_til_today):
        sessions = cls.all()
        user_set = set()

        for session in sessions:
            if session.start_time > get_current_time() - datetime.timedelta(
                days=days_til_today
            ):
                user_set.add(session.creator_id)

        return len(user_set)

    @classmethod
    def sessions_date_list(cls, days_til_today):
        sessions = cls.all()
        sessions_date_list = []

        for session in sessions:
            if session.start_time > datetime.datetime.now() - datetime.timedelta(
                days=days_til_today
            ):
                sessions_date_list.append(
                    int(datetime.datetime.timestamp(session.start_time))
                )

        return sessions_date_list
