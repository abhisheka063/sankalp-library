# Sankalp Library Registration Portal

Responsive React + TypeScript frontend, FastAPI backend, PostgreSQL, private registration PDFs, and admin workflow. The application collects no Aadhaar or password from students. The public page now uses the supplied Sankalp Library poster and lists its advertised facilities and contact number (9939697490).

## Code layout

```text
backend/app/
  api/          Public and admin route handlers, audit helper
  core/         Environment configuration and authentication
  db/           SQLAlchemy engine and session lifecycle
  models/       Database entities
  schemas/      Request validation models
  services/     Registration PDF generation
  main.py       FastAPI assembly and lifespan
frontend/src/
  components/   Registration, shared branding, and admin UI components
  services/     Typed HTTP client and downloads
  types/        Shared API types
  utils/        Form constants and idempotency helpers
  App.tsx       Page composition
```

## Run locally with Docker

1. Copy `.env.example` to `.env` and replace the secret key, admin password, and Postgres password. The sample defaults are for local development only.
2. Run `docker compose up --build` from this directory.
3. Open the public site at `http://localhost:8080` and admin at `http://localhost:8080/admin`. API health is at `http://localhost:8000/health`.
4. On first start the API creates the schema and two sample plans (Monthly ₹500 and Quarterly ₹1350). Update these through the database for now; fee management UI is not yet implemented.

For split development: start PostgreSQL and set `DATABASE_URL`, install `backend/requirements.txt`, then run `uvicorn app.main:app --reload` from `backend`. Run `npm install && npm run dev` from `frontend`; Vite proxies `/api` to `http://127.0.0.1:8000` for local development. The dev server can use another available port if 5173 is occupied.

## Workflow and security

Registration writes an application with `Pending Approval`, generates a unique `SANK-YYYY-NNNN` number, and generates a PDF. A random 256-bit URL-safe token grants access only to that application's PDF; it is not an enumerable database ID. Repeated submissions with the same idempotency key return the original application. The mobile number duplicate check avoids a second active application. PDF generation errors are retained and the admin can regenerate. Payment can be set to `Paid` only when a payment reference is provided; verify the actual payment out of band before doing so.

Admin credentials come from environment variables. Password comparison is constant-time; sessions are signed JWTs with an eight-hour expiry. Use a strong random `SECRET_KEY`, HTTPS, protected environment configuration, network-restricted database, and persistent private PDF volume. CSV, records, and status changes require the admin bearer token. Audit records capture status changes, exports, and PDF regeneration.

## Deployment and QR

Deploy the Compose services behind a TLS reverse proxy, expose only HTTPS to the public, and restrict database access. Set `PUBLIC_URL` to the final public registration URL before generating a production QR. Admin endpoint `GET /api/admin/qr.png` downloads a QR PNG for that configured URL. A production print poster can be assembled with that PNG, library name/address, and “Scan to Register”; the API currently does not generate a poster PDF. Never use localhost in production. Verify CORS origins and frontend API routing for the chosen domain.

Back up PostgreSQL with `docker compose exec -T db pg_dump -U sankalp sankalp > backup.sql` and the `pdfdata` volume separately. Restore the SQL with `docker compose exec -T db psql -U sankalp sankalp < backup.sql`, then restore the PDF volume from its encrypted backup. Test restores periodically. Establish a retention schedule, export/delete request process, encryption-at-rest policy, and backups before launch.

## Configuration

Address, contact, name, terms, database, public URL, credentials, storage directory, and CORS origins are environment-configured. Exam categories are validated by the backend. Admin membership plan list and update endpoints are available at `/api/admin/plans`; study timings remain configured in the public config route. The supplied Hindi poster and Hindi public headline are browser-rendered; the PDF uses ReportLab's default font and does not embed a Devanagari font. Supply a licensed Unicode font and register it in `backend/app/services/pdf_service.py` before including Hindi in PDFs.

## Tests

Backend: `cd backend && pip install -r requirements.txt && pytest`.
Frontend: `cd frontend && npm install && npm test` (Vitest is included; additional UI coverage can be added).
Build frontend with `npm run build`.

## Production checklist

- Replace all placeholder secrets and contact details; set production `PUBLIC_URL` and CORS.
- Configure TLS, reverse proxy/API path, persistent encrypted backups, retention and monitoring.
- Change sample plan prices and terms; verify payment before marking Paid.
- Configure a licensed Hindi font if Hindi must appear in PDFs.
- Add rate limiting at the reverse proxy (public registration currently has idempotency and duplicate checks but no built-in distributed rate limiter).
- Validate admin access controls and take a successful restore test before public launch.

API docs are available at `/docs` on the API service.
