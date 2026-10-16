from datetime import datetime
from pathlib import Path
import secrets

from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session

from ..core.config import settings
from ..db.session import get_db
from ..models import Plan, Registration
from ..schemas.registration import RegistrationIn
from ..services.pdf_service import generate_registration_pdf, remove_pdf

router = APIRouter(prefix="/api", tags=["public"])
FACILITIES = [
    "High-speed Wi-Fi", "Comfortable study seating", "CCTV security",
    "Proper lighting", "Clean drinking water", "AC / non-AC environment",
]


@router.get("/public/config")
def public_config(db: Session = Depends(get_db)):
    return {
        "name": settings.library_name, "address": settings.library_address,
        "phone": settings.contact_phone, "terms": settings.terms,
        "facilities": FACILITIES,
        "timings": ["Morning", "Afternoon", "Evening", "Flexible"],
        "plans": [
            {"id": plan.id, "name": plan.name, "fee_monthly": plan.fee_monthly}
            for plan in db.query(Plan).filter_by(active=True)
        ],
    }


@router.post("/register")
def register(data: RegistrationIn, request: Request, db: Session = Depends(get_db)):
    prior = db.query(Registration).filter_by(idempotency_key=data.idempotency_key).first()
    if prior:
        return {"registration_no": prior.registration_no, "download_token": prior.pdf_token,
                "status": prior.status, "payment_mode": prior.payment_mode, "amount_due": prior.amount_due}
    plan = db.get(Plan, data.plan_id)
    if not plan or not plan.active:
        raise HTTPException(422, "Membership plan is unavailable")
    duplicate = db.query(Registration).filter_by(mobile=data.mobile).filter(Registration.status != "Rejected").first()
    if duplicate:
        raise HTTPException(409, "An application for this mobile number already exists. Contact the library for help.")
    year = datetime.now().year
    registration_no = f"SANK-{year}-{secrets.randbelow(900000) + 100000}"
    registration = Registration(
        **data.model_dump(exclude={"idempotency_key"}), registration_no=registration_no,
        idempotency_key=data.idempotency_key, pdf_token=secrets.token_urlsafe(32),
        amount_due=plan.fee_monthly,
        payment_status="Pending" if data.payment_mode == "Online" else "Unverified",
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)
    try:
        registration.pdf_path = generate_registration_pdf(registration)
        db.commit()
    except Exception as error:
        registration.pdf_error = type(error).__name__
        db.commit()
    return {"registration_no": registration.registration_no, "download_token": registration.pdf_token,
            "status": registration.status, "payment_mode": registration.payment_mode,
            "amount_due": registration.amount_due}


@router.get("/download/{token}")
def download_registration_pdf(token: str, db: Session = Depends(get_db)):
    registration = db.query(Registration).filter_by(pdf_token=token).first()
    if not registration:
        raise HTTPException(404, "Registration not found")
    # Always render from the latest row. This prevents a previously generated
    # pending form being served after an administrator changes the status.
    try:
        previous_path = registration.pdf_path
        registration.pdf_path = generate_registration_pdf(registration)
        registration.pdf_error = None
        db.commit()
        if previous_path != registration.pdf_path:
            remove_pdf(previous_path)
    except Exception as error:
        registration.pdf_error = type(error).__name__
        db.commit()
        raise HTTPException(503, "PDF is temporarily unavailable. Please contact the library.") from error
    return Response(
        Path(registration.pdf_path).read_bytes(), media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{registration.registration_no}.pdf"'},
    )
