import base64
import os
import re
import secrets
import zlib

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, inspect, text

from app.core.config import settings
from app.main import app
from app.db import migrations


def pdf_text_stream(pdf_bytes: bytes) -> bytes:
    """Decode ReportLab's ASCII85 + Flate page-content streams for assertions."""
    result = []
    for stream in re.findall(rb"/Filter \[ /ASCII85Decode /FlateDecode \].*?stream\n(.*?)~>endstream", pdf_bytes, re.S):
        result.append(zlib.decompress(base64.a85decode(stream + b"~>", adobe=True)))
    return b" ".join(result)


def test_health_and_admin_records_are_protected():
    with TestClient(app) as client:
        assert client.get("/health").json() == {"status": "ok"}
        assert client.get("/api/admin/registrations").status_code in (401, 403)


def test_approved_status_is_reflected_in_downloaded_pdf(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "storage_dir", str(tmp_path))
    with TestClient(app) as client:
        config_response = client.get("/api/public/config")
        assert config_response.status_code == 200
        config = config_response.json()
        login = client.post("/api/admin/login", json={
            "username": settings.admin_username,
            "password": settings.admin_password,
        })
        assert login.status_code == 200
        headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
        mobile = "9" + str(secrets.randbelow(10**9)).zfill(9)
        payload = {
            "full_name": "Portal Workflow Student",
            "mobile": mobile,
            "address": "Test address, Raghunathpur, Siwan",
            "exam_category": "SSC",
            "study_timing": "Morning",
            "plan_id": config["plans"][0]["id"],
            "accepted_terms": True,
            "payment_mode": "Cash",
            "idempotency_key": secrets.token_urlsafe(24),
        }
        created = client.post("/api/register", json=payload)
        assert created.status_code == 200
        registration = created.json()
        assert registration["payment_mode"] == "Cash"
        assert registration["amount_due"] == config["plans"][0]["fee_monthly"]

        pending_pdf = client.get(f"/api/download/{registration['download_token']}")
        assert pending_pdf.status_code == 200
        assert b"Pending Approval" in pdf_text_stream(pending_pdf.content)
        assert b"Cash at reception" in pdf_text_stream(pending_pdf.content)

        approved = client.patch(
            f"/api/admin/registrations/{registration['registration_no']}",
            headers=headers,
            json={"status": "Approved"},
        )
        assert approved.status_code == 200

        approved_pdf = client.get(f"/api/download/{registration['download_token']}")
        assert approved_pdf.status_code == 200
        assert b"Approved" in pdf_text_stream(approved_pdf.content)


def test_online_registration_saves_mode_amount_and_coming_soon_pdf(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "storage_dir", str(tmp_path))
    with TestClient(app) as client:
        config = client.get("/api/public/config").json()
        plan = config["plans"][0]
        created = client.post("/api/register", json={
            "full_name": "Online Payment Test",
            "mobile": "9" + str(secrets.randbelow(10**9)).zfill(9),
            "address": "Test address, Raghunathpur, Siwan",
            "exam_category": "SSC",
            "study_timing": "Morning",
            "plan_id": plan["id"],
            "accepted_terms": True,
            "payment_mode": "Online",
            "idempotency_key": secrets.token_urlsafe(24),
        })
        assert created.status_code == 200
        registration = created.json()
        assert registration["payment_mode"] == "Online"
        assert registration["amount_due"] == plan["fee_monthly"]
        pdf = client.get(f"/api/download/{registration['download_token']}")
        assert pdf.status_code == 200
        content = pdf_text_stream(pdf.content)
        assert b"Online" in content and b"coming soon" in content
        assert f"{plan['fee_monthly']}".encode() in content


def test_admin_can_delete_registration_and_its_pdf(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "storage_dir", str(tmp_path))
    with TestClient(app) as client:
        config = client.get("/api/public/config").json()
        created = client.post("/api/register", json={
            "full_name": "Delete Workflow Test",
            "mobile": "9" + str(secrets.randbelow(10**9)).zfill(9),
            "address": "Test address, Raghunathpur, Siwan",
            "exam_category": "SSC",
            "study_timing": "Morning",
            "plan_id": config["plans"][0]["id"],
            "accepted_terms": True,
            "payment_mode": "Cash",
            "idempotency_key": secrets.token_urlsafe(24),
        })
        assert created.status_code == 200
        registration = created.json()
        pdf = client.get(f"/api/download/{registration['download_token']}")
        assert pdf.status_code == 200

        path = f"/api/admin/registrations/{registration['registration_no']}"
        assert client.delete(path).status_code in (401, 403)
        login = client.post("/api/admin/login", json={
            "username": settings.admin_username,
            "password": settings.admin_password,
        })
        headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
        deleted = client.delete(path, headers=headers)
        assert deleted.status_code == 200
        assert deleted.json() == {"ok": True}
        assert client.get(f"/api/download/{registration['download_token']}").status_code == 404
        assert client.get(path, headers=headers).status_code == 404


def test_existing_database_payment_columns_are_added_and_backfilled(tmp_path, monkeypatch):
    test_engine = create_engine(f"sqlite:///{tmp_path / 'legacy.db'}")
    with test_engine.begin() as connection:
        connection.execute(text("CREATE TABLE membership_plans (id INTEGER PRIMARY KEY, fee_monthly INTEGER NOT NULL)"))
        connection.execute(text("CREATE TABLE registrations (id INTEGER PRIMARY KEY, plan_id INTEGER NOT NULL)"))
        connection.execute(text("INSERT INTO membership_plans (id, fee_monthly) VALUES (1, 1350)"))
        connection.execute(text("INSERT INTO registrations (id, plan_id) VALUES (1, 1)"))
    monkeypatch.setattr(migrations, "engine", test_engine)

    migrations.ensure_registration_payment_fields()
    migrations.ensure_registration_payment_fields()

    columns = {column["name"] for column in inspect(test_engine).get_columns("registrations")}
    with test_engine.connect() as connection:
        row = connection.execute(text("SELECT payment_mode, amount_due FROM registrations WHERE id=1")).one()
    assert {"payment_mode", "amount_due"}.issubset(columns)
    assert row == ("Cash", 1350)
    test_engine.dispose()
