import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class RegistrationIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    mobile: str
    address: str = Field(min_length=4, max_length=1000)
    dob: str | None = None
    exam_category: str
    study_timing: str
    plan_id: int
    emergency_contact: str | None = None
    accepted_terms: bool
    payment_mode: Literal["Cash", "Online"] = "Cash"
    idempotency_key: str = Field(min_length=12, max_length=80)

    @field_validator("mobile", "emergency_contact")
    @classmethod
    def valid_mobile(cls, value):
        if value is not None and not re.fullmatch(r"[6-9][0-9]{9}", value):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return value

    @field_validator("exam_category")
    @classmethod
    def valid_exam(cls, value):
        allowed = {"SSC", "Railway", "Banking", "Bihar government exams", "UPSC", "Other"}
        if value not in allowed:
            raise ValueError("Choose a listed exam category")
        return value

    @field_validator("accepted_terms")
    @classmethod
    def terms_required(cls, value):
        if not value:
            raise ValueError("Acceptance is required")
        return value


class AdminLogin(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=200)
