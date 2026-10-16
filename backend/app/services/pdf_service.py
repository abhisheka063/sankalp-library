import os
import secrets
from datetime import date
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from ..core.config import settings


def generate_registration_pdf(registration) -> str:
    """Render the PDF from the current registration record and return its private path."""
    os.makedirs(settings.storage_dir, exist_ok=True)
    path = os.path.join(settings.storage_dir, f"{secrets.token_hex(20)}.pdf")
    document = SimpleDocTemplate(
        path, pagesize=A4, rightMargin=20 * mm, leftMargin=20 * mm,
        topMargin=16 * mm, bottomMargin=16 * mm,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "SankalpTitle", parent=styles["Title"],
        textColor=colors.HexColor("#12294b"), fontSize=20,
    )
    story = [
        Paragraph(escape(settings.library_name), title_style),
        Paragraph(escape(settings.library_address), styles["Normal"]),
        Paragraph(escape(settings.contact_phone), styles["Normal"]),
        Spacer(1, 8 * mm),
        Paragraph("MEMBERSHIP REGISTRATION FORM", styles["Heading2"]),
        Spacer(1, 3 * mm),
    ]
    fields = [
        ["Registration number", registration.registration_no, "Registration date", str(date.today())],
        ["Full name", registration.full_name, "Status", registration.status],
        ["Mobile", registration.mobile, "Exam category", registration.exam_category],
        ["Address", registration.address, "Study timing", registration.study_timing],
        ["Membership plan", registration.plan.name, "Monthly fee", f"₹{registration.plan.fee_monthly}"],
        ["Payment mode", "Cash at reception" if registration.payment_mode == "Cash" else "Online (coming soon)",
         "Amount due", f"₹{registration.amount_due}"],
    ]
    table = Table(fields, colWidths=[31 * mm, 54 * mm, 31 * mm, 54 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#eaf0f7")),
        ("BACKGROUND", (2, 0), (2, -1), colors.HexColor("#eaf0f7")),
        ("GRID", (0, 0), (-1, -1), .4, colors.HexColor("#aab6c5")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story += [
        table, Spacer(1, 8 * mm),
        Paragraph("Declaration and membership terms", styles["Heading3"]),
        Paragraph(escape(settings.terms), styles["BodyText"]), Spacer(1, 18 * mm),
        Paragraph("Student signature: ____________________   Administrator: ____________________", styles["Normal"]),
        Spacer(1, 12 * mm),
        Paragraph("Office remarks: ______________________________________________________________", styles["Normal"]),
    ]
    document.build(story)
    return path


def remove_pdf(path: str | None) -> None:
    """Remove an older private PDF after a replacement has been persisted."""
    if not path:
        return
    try:
        Path(path).unlink(missing_ok=True)
    except OSError:
        # Keeping an orphaned private file is safer than failing a registration update.
        pass
