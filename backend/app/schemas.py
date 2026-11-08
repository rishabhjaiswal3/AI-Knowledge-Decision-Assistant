import re
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


def _clean(v: str) -> str:
    v = re.sub(r"\s+", " ", v).strip()
    if not v:
        raise ValueError("can't be blank")
    return v


class RegisterIn(BaseModel):
    organization_name: str = Field(min_length=2, max_length=120)
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)  # bcrypt uses the first 72 bytes

    @field_validator("organization_name", "name")
    @classmethod
    def clean_names(cls, v: str) -> str:
        return _clean(v)

    @field_validator("password")
    @classmethod
    def strong_enough(cls, v: str) -> str:
        if not (re.search(r"[A-Za-z]", v) and re.search(r"\d", v)):
            raise ValueError("use at least one letter and one number")
        return v


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class OrganizationOut(BaseModel):

    id: str = Field(validation_alias="_id")
    name: str
    created_at: datetime


class UserOut(BaseModel):

    id: str = Field(validation_alias="_id")
    name: str
    email: str


class SessionOut(BaseModel):
    """The token itself is never in the body; it's only in the HttpOnly cookie."""

    user: UserOut
    organization: OrganizationOut
