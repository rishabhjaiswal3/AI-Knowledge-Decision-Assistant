from typing import Any

from fastapi import APIRouter, HTTPException, Response, status
from pymongo.errors import DuplicateKeyError

from app.db import new_id, now
from app.deps import DB, CurrentUser
from app.schemas import LoginIn, OrganizationOut, RegisterIn, SessionOut, UserOut
from app.security import (
    DUMMY_HASH,
    clear_session_cookie,
    create_session_token,
    hash_password,
    set_session_cookie,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

EMAIL_TAKEN = "An account with this email already exists. Try signing in."


def _session_out(user: dict[str, Any], org: dict[str, Any]) -> SessionOut:
    return SessionOut(user=UserOut.model_validate(user), organization=OrganizationOut.model_validate(org))


def _start_session(response: Response, user: dict[str, Any], org: dict[str, Any]) -> SessionOut:
    set_session_cookie(response, create_session_token(user["_id"], user["organization_id"]))
    return _session_out(user, org)


@router.post("/register", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterIn, response: Response, db: DB) -> SessionOut:
    created = now()
    org = {"_id": new_id(), "name": body.organization_name, "created_at": created}
    user = {
        "_id": new_id(),
        "organization_id": org["_id"],
        "name": body.name,
        "email": body.email.lower(),
        "password_hash": hash_password(body.password),
        "created_at": created,
    }
    # The user goes first: the unique email index rejects duplicates (even two
    # sign-ups at the same moment) before any organization is created.
    try:
        await db.users.insert_one(user)
    except DuplicateKeyError:
        raise HTTPException(status.HTTP_409_CONFLICT, EMAIL_TAKEN) from None
    try:
        await db.organizations.insert_one(org)
    except Exception:
        await db.users.delete_one({"_id": user["_id"]})
        raise
    return _start_session(response, user, org)


@router.post("/login", response_model=SessionOut)
async def login(body: LoginIn, response: Response, db: DB) -> SessionOut:
    user = await db.users.find_one({"email": body.email.lower()})
    ok = verify_password(body.password, user["password_hash"] if user else DUMMY_HASH)
    if user is None or not ok:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password.")
    org = await db.organizations.find_one({"_id": user["organization_id"]})
    if org is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password.")
    return _start_session(response, user, org)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    clear_session_cookie(response)


@router.get("/me", response_model=SessionOut)
async def me(user: CurrentUser, db: DB) -> SessionOut:
    org = await db.organizations.find_one({"_id": user["organization_id"]})
    if org is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Please sign in to continue.")
    return _session_out(user, org)
