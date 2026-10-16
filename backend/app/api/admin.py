import csv
import io
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.security import authenticate_admin, verify_admin
from ..db.session import get_db
from ..models import Plan, Registration
from ..schemas.registration import AdminLogin
from ..services.pdf_service import generate_registration_pdf, remove_pdf
from .dependencies import record_audit

router = APIRouter(prefix="/api/admin", tags=["admin"])


class RegistrationUpdate(BaseModel):
    status: str | None = None
    payment_status: str | None = None
    payment_reference: str | None = Field(default=None, max_length=100)
    membership_status: str | None = None
    start_date: str | None = None
    expiry_date: str | None = None


class PlanUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    fee_monthly: int = Field(ge=0, le=1000000)
    active: bool = True


@router.post("/login")
def login(payload: AdminLogin):
    token = authenticate_admin(payload.username, payload.password)
    if not token:
        raise HTTPException(401, "Incorrect username or password")
    return {"access_token": token, "token_type": "bearer"}


@router.get("/summary")
def summary(_: str = Depends(verify_admin), db: Session = Depends(get_db)):
    return {
        "total": db.query(Registration).count(),
        "pending": db.query(Registration).filter_by(status="Pending Approval").count(),
        "approved": db.query(Registration).filter_by(status="Approved").count(),
        "rejected": db.query(Registration).filter_by(status="Rejected").count(),
        "active": db.query(Registration).filter_by(membership_status="Active").count(),
    }


@router.get("/registrations")
def registrations(q: str = "", status: str = "", _: str = Depends(verify_admin), db: Session = Depends(get_db)):
    query = db.query(Registration)
    if q:
        query = query.filter(or_(Registration.full_name.ilike(f"%{q}%"), Registration.mobile.ilike(f"%{q}%"), Registration.registration_no.ilike(f"%{q}%")))
    if status:
        query = query.filter_by(status=status)
    return [
        {"registration_no": row.registration_no, "full_name": row.full_name,
         "mobile": row.mobile, "exam_category": row.exam_category, "status": row.status,
         "payment_mode": row.payment_mode, "amount_due": row.amount_due,
         "payment_status": row.payment_status, "membership_status": row.membership_status,
         "created_at": row.created_at, "download_token": row.pdf_token}
        for row in query.order_by(Registration.id.desc()).limit(500)
    ]


@router.get("/registrations/{number}")
def registration_detail(number: str, _: str = Depends(verify_admin), db: Session = Depends(get_db)):
    row = db.query(Registration).filter_by(registration_no=number).first()
    if not row:
        raise HTTPException(404, "Not found")
    return {key: getattr(row, key) for key in (
        "registration_no", "full_name", "mobile", "address", "dob", "exam_category",
        "study_timing", "status", "payment_mode", "amount_due", "payment_status", "payment_reference", "membership_status",
        "start_date", "expiry_date", "pdf_error",
    )} | {"plan": row.plan.name, "fee_monthly": row.plan.fee_monthly, "download_token": row.pdf_token}


@router.patch("/registrations/{number}")
def update_registration(number: str, payload: RegistrationUpdate, _: str = Depends(verify_admin), db: Session = Depends(get_db)):
    row = db.query(Registration).filter_by(registration_no=number).first()
    if not row:
        raise HTTPException(404, "Not found")
    changes = payload.model_dump(exclude_unset=True)
    valid_values = {
        "status": {"Pending Approval", "Approved", "Rejected"},
        "payment_status": {"Unverified", "Pending", "Paid"},
        "membership_status": {"Not Active", "Active", "Expired"},
    }
    for field, allowed in valid_values.items():
        if field in changes and changes[field] not in allowed:
            raise HTTPException(422, f"Invalid {field}")
    if changes.get("payment_status") == "Paid" and not changes.get("payment_reference", row.payment_reference):
        raise HTTPException(422, "Payment reference is required to record verified payment")
    previous_pdf_path = row.pdf_path
    for field, value in changes.items():
        setattr(row, field, value)
    # Any update can affect values printed in the registration PDF.
    row.pdf_path = None
    row.pdf_error = None
    db.commit()
    remove_pdf(previous_pdf_path)
    record_audit(db, "registration_updated", number, ",".join(changes.keys()))
    return {"ok": True}


@router.delete("/registrations/{number}")
def delete_registration(number: str, _: str = Depends(verify_admin), db: Session = Depends(get_db)):
    row = db.query(Registration).filter_by(registration_no=number).first()
    if not row:
        raise HTTPException(404, "Not found")
    pdf_path = row.pdf_path
    db.delete(row)
    db.commit()
    remove_pdf(pdf_path)
    record_audit(db, "registration_deleted", number)
    return {"ok": True}


@router.post("/registrations/{number}/regenerate")
def regenerate_pdf(number: str, _: str = Depends(verify_admin), db: Session = Depends(get_db)):
    row = db.query(Registration).filter_by(registration_no=number).first()
    if not row:
        raise HTTPException(404, "Not found")
    try:
        previous_path = row.pdf_path
        row.pdf_path = generate_registration_pdf(row)
        row.pdf_error = None
        db.commit()
        if previous_path != row.pdf_path:
            remove_pdf(previous_path)
        record_audit(db, "pdf_regenerated", number)
        return {"ok": True}
    except Exception as error:
        row.pdf_error = type(error).__name__
        db.commit()
        raise HTTPException(500, "PDF regeneration failed") from error


@router.get("/plans")
def list_plans(_: str = Depends(verify_admin), db: Session = Depends(get_db)):
    return [{"id": plan.id, "name": plan.name, "fee_monthly": plan.fee_monthly, "active": plan.active} for plan in db.query(Plan).order_by(Plan.id)]


@router.put("/plans/{plan_id}")
def update_plan(plan_id: int, payload: PlanUpdate, _: str = Depends(verify_admin), db: Session = Depends(get_db)):
    plan = db.get(Plan, plan_id)
    if not plan:
        raise HTTPException(404, "Plan not found")
    plan.name, plan.fee_monthly, plan.active = payload.name, payload.fee_monthly, payload.active
    db.commit()
    record_audit(db, "plan_updated", detail=f"{plan.id}:{plan.name}")
    return {"ok": True}


@router.get("/export.csv")
def export_csv(_: str = Depends(verify_admin), db: Session = Depends(get_db)):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Registration", "Name", "Mobile", "Exam", "Status", "Payment mode", "Amount due", "Payment status", "Membership"])
    for row in db.query(Registration).all():
        writer.writerow([row.registration_no, row.full_name, row.mobile, row.exam_category, row.status, row.payment_mode, row.amount_due, row.payment_status, row.membership_status])
    record_audit(db, "csv_export")
    return Response(output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=registrations.csv"})


@router.get("/qr.png")
def registration_qr(_: str = Depends(verify_admin)):
    import qrcode
    image = qrcode.make(settings.public_url)
    output = BytesIO()
    image.save(output, format="PNG")
    return Response(output.getvalue(), media_type="image/png")
