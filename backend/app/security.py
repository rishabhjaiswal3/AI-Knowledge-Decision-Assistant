from datetime import UTC, datetime, timedelta

import bcrypt
import jwt
from fastapi import Response

from app.config import get_settings

ALGORITHM = "HS256"
# Dashboard sessions carry this audience. Assistant tokens (later) are plain
# random strings, so they can never pass as a dashboard login.
AUDIENCE = "kda-admin"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), password_hash.encode())
    except ValueError:
        return False


# Compared against when the email doesn't exist, so a wrong email and a wrong
# password take the same time.
DUMMY_HASH = hash_password("not-a-real-password")


def create_session_token(user_id: str, organization_id: str) -> str:
    s = get_settings()
    now = datetime.now(UTC)
    payload = {"sub": user_id, "org": organization_id, "aud": AUDIENCE, "iat": now, "exp": now + timedelta(minutes=s.session_minutes)}
    return jwt.encode(payload, s.jwt_secret, algorithm=ALGORITHM)


def decode_session_token(token: str) -> dict:
    return jwt.decode(token, get_settings().jwt_secret, algorithms=[ALGORITHM], audience=AUDIENCE)


def set_session_cookie(response: Response, token: str) -> None:
    s = get_settings()
    response.set_cookie(
        s.cookie_name, token,
        max_age=s.session_minutes * 60,
        httponly=True,              # JavaScript can't read it
        secure=s.cookie_secure,     # HTTPS only in production
        samesite=s.cookie_samesite, # not sent on cross-site POSTs (CSRF)
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    s = get_settings()
    response.delete_cookie(s.cookie_name, path="/", httponly=True, secure=s.cookie_secure, samesite=s.cookie_samesite)
