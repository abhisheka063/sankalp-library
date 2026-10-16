from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.admin import router as admin_router
from .api.public import router as public_router
from .core.config import settings
from .db.session import Base, SessionLocal, engine
from .db.migrations import ensure_registration_payment_fields
from .models import Plan  # Import models before creating the local development schema.

@asynccontextmanager
async def lifespan(_: FastAPI):
    """Create local schema and starter plans. Use Alembic migrations in deployed environments."""
    Base.metadata.create_all(bind=engine)
    ensure_registration_payment_fields()
    with SessionLocal() as db:
        if db.query(Plan).count() == 0:
            db.add_all([Plan(name="Monthly", fee_monthly=500), Plan(name="Quarterly", fee_monthly=1350)])
            db.commit()
    yield


app = FastAPI(title="Sankalp Library API", version="1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(public_router)
app.include_router(admin_router)


@app.get("/health", tags=["operations"])
def health():
    return {"status": "ok"}
