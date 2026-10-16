from sqlalchemy.orm import Session

from ..db.session import get_db
from ..models import AuditLog


def record_audit(db: Session, action: str, registration_no: str | None = None, detail: str = "") -> None:
    db.add(AuditLog(action=action, registration_no=registration_no, detail=detail))
    db.commit()
