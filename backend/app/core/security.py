from datetime import datetime, timedelta
import secrets

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from .config import settings

bearer_scheme = HTTPBearer(auto_error=True)


def verify_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    try:
        payload = jwt.decode(
            credentials.credentials, settings.secret_key, algorithms=["HS256"]
        )
        if payload.get("sub") != settings.admin_username:
            raise JWTError("Invalid subject")
        return payload["sub"]
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired session") from exc


def authenticate_admin(username: str, password: str) -> str | None:
    if username != settings.admin_username or not secrets.compare_digest(
        password, settings.admin_password
    ):
        return None
    return jwt.encode(
        {
            "sub": settings.admin_username,
            "exp": datetime.utcnow() + timedelta(hours=8),
        },
        settings.secret_key,
        algorithm="HS256",
    )
