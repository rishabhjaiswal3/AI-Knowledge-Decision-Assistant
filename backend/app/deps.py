from typing import Annotated, Any

import jwt
from fastapi import Depends, HTTPException, Request, status
from pymongo.asynchronous.database import AsyncDatabase

from app.config import get_settings
from app.db import get_db
from app.security import decode_session_token

DB = Annotated[AsyncDatabase, Depends(get_db)]


async def current_user(request: Request, db: DB) -> dict[str, Any]:
    """Reads the HttpOnly session cookie. Any problem means 'not signed in'."""
    unauthorized = HTTPException(status.HTTP_401_UNAUTHORIZED, "Please sign in to continue.")
    token = request.cookies.get(get_settings().cookie_name)
    if not token:
        raise unauthorized
    try:
        claims = decode_session_token(token)
    except jwt.PyJWTError:
        raise unauthorized from None
    user = await db.users.find_one({"_id": claims.get("sub"), "organization_id": claims.get("org")})
    if user is None:
        raise unauthorized
    return user


CurrentUser = Annotated[dict[str, Any], Depends(current_user)]
