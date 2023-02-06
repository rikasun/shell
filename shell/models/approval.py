import time
from datetime import datetime
from sqlalchemy import Column, ForeignKey, Integer, String, JSON, Boolean, DateTime
from sqlalchemy.event import listen
from sqlalchemy.orm import relationship
from sqlalchemy import event
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy_state_machine import StateConfig, StateMixin
from sqlalchemy.ext.hybrid import hybrid_property

from shell.models.base import Base
from shell.models.approval_setting import ApprovalSettings
from shell.utils import later_than_now

REQUESTED = "requested"
APPROVED = "approved"
DENIED = "denied"
TIMED_OUT = "timed out"
CANCELLED = "cancelled"


class Approval(Base, StateMixin):
    __repr_attrs__ = ["status", "program_id", "prompt", "expired_at"]

    state_config = StateConfig(
        initial=REQUESTED,
        states=[REQUESTED, APPROVED, DENIED, TIMED_OUT, CANCELLED],
        transitions=[
            ["approve", REQUESTED, APPROVED],
            ["deny", REQUESTED, DENIED],
            ["cancel", REQUESTED, CANCELLED],
            ["timeout", REQUESTED, TIMED_OUT],
        ],
    )
    status = Column("state", String(30))
    requestor_id = Column(Integer, ForeignKey("user.id"))
    responder_id = Column(Integer, ForeignKey("user.id"))
    program_id = Column(Integer, ForeignKey("program.id"))
    log_entry_id = Column(Integer, ForeignKey("log_entry.id"))
    prompt = Column(String)
    ip_address = Column(String(30))
    reason = Column(String(1000))
    command = Column(String(1000))
    metadata_ = Column("metadata", JSON, default={})
    was_auto_approved = Column(Boolean, default=False)
    # approved requests responded time + approval duration
    expired_at = Column(DateTime)

    requestor = relationship(
        "User", foreign_keys=[requestor_id], back_populates="approvals_requested"
    )
    responder = relationship("User", foreign_keys=[responder_id])
    program = relationship("Program", back_populates="approvals")
    log_entry = relationship("LogEntry", back_populates="approval")
    organization = association_proxy("requestor", "organization")

    @hybrid_property
    def approval_settings(self):
        if self.program:
            return self.program.approval_settings
        elif self.prompt:
            settings = ApprovalSettings().find_by(prompt=self.prompt)
            if len(settings) > 0:
                return settings[0]

        return None

    @hybrid_property
    def is_timed_out(self):
        if not self.approval_settings:
            return False
        approval_timeout = self.approval_settings.approval_timeout  # in minutes
        current_time = int(time.time())
        approval_timeout_time = (
            int(datetime.timestamp(self.created_at)) + approval_timeout * 60000
        )
        if current_time > approval_timeout_time:
            return True

        return False

    @hybrid_property
    def within_approval_window(self):
        if not self.approval_settings:
            return False

        approvals_within_approval_window = filter(
            lambda a: a.status == "approved"
            and a.id != self.id
            and not later_than_now(a.expired_at),
            self.requestor.approvals_requested,
        )

        if self.program:
            command_approvals_within_approval_window = filter(
                lambda a: a.program == self.program, approvals_within_approval_window
            )

            if list(command_approvals_within_approval_window):
                return True

        # command approval live inside a access approval
        elif self.prompt:
            access_approvals_within_approval_window = filter(
                lambda a: a.prompt == self.prompt, approvals_within_approval_window
            )

            if list(access_approvals_within_approval_window):
                return True
        return False


listen(Approval, "init", Approval.init_state_machine)
listen(Approval, "load", Approval.init_state_machine)
