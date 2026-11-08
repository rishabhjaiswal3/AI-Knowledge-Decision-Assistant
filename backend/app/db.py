"""MongoDB access.

Collections:
  organizations  { _id, name, created_at }
  users          { _id, organization_id, name, email, password_hash, created_at }

Every tenant-owned document carries organization_id, and every query filters on
it, so one organization's data never reaches another's.
"""

import uuid
from datetime import UTC, datetime

from pymongo import ASCENDING, AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from app.config import get_settings

_client: AsyncMongoClient | None = None


def new_id() -> str:
    return str(uuid.uuid4())


def now() -> datetime:
    return datetime.now(UTC)


def get_client() -> AsyncMongoClient:
    global _client
    if _client is None:
        _client = AsyncMongoClient(get_settings().mongodb_uri, tz_aware=True, uuidRepresentation="standard")
    return _client


def get_db() -> AsyncDatabase:
    return get_client()[get_settings().mongodb_db]


async def init_db() -> None:
    """Check the connection and create indexes (idempotent)."""
    db = get_db()
    await db.command("ping")
    # Emails are stored lowercase, so this also makes them case-insensitive unique.
    await db.users.create_index([("email", ASCENDING)], unique=True, name="email_unique")
    await db.users.create_index([("organization_id", ASCENDING)], name="organization_id")


async def close_db() -> None:
    global _client
    if _client is not None:
        await _client.close()
        _client = None
