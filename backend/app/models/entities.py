from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


class Plan(Base):
    __tablename__ = "membership_plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)
    fee_monthly: Mapped[int] = mapped_column(Integer, default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class Registration(Base):
    __tablename__ = "registrations"
    __table_args__ = (
        UniqueConstraint("registration_no"),
        UniqueConstraint("idempotency_key"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    registration_no: Mapped[str] = mapped_column(String(30), index=True)
    idempotency_key: Mapped[str] = mapped_column(String(80))
    full_name: Mapped[str] = mapped_column(String(120), index=True)
    mobile: Mapped[str] = mapped_column(String(10), index=True)
    address: Mapped[str] = mapped_column(Text)
    dob: Mapped[str | None] = mapped_column(String(10), nullable=True)
    exam_category: Mapped[str] = mapped_column(String(60))
    study_timing: Mapped[str] = mapped_column(String(80))
    plan_id: Mapped[int] = mapped_column(ForeignKey("membership_plans.id"))
    emergency_contact: Mapped[str | None] = mapped_column(String(10), nullable=True)
    accepted_terms: Mapped[bool] = mapped_column(Boolean)
    payment_mode: Mapped[str] = mapped_column(String(16), default="Cash", server_default="Cash")
    amount_due: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    status: Mapped[str] = mapped_column(String(24), default="Pending Approval", index=True)
    payment_status: Mapped[str] = mapped_column(String(16), default="Unverified")
    payment_reference: Mapped[str | None] = mapped_column(String(100), nullable=True)
    membership_status: Mapped[str] = mapped_column(String(20), default="Not Active")
    start_date: Mapped[str | None] = mapped_column(String(10), nullable=True)
    expiry_date: Mapped[str | None] = mapped_column(String(10), nullable=True)
    pdf_token: Mapped[str] = mapped_column(String(64), unique=True)
    pdf_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    pdf_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())
    plan: Mapped[Plan] = relationship()


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    action: Mapped[str] = mapped_column(String(60))
    registration_no: Mapped[str | None] = mapped_column(String(30), nullable=True)
    detail: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())
