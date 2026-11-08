from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Required, no defaults: the app won't start without real values.
    mongodb_uri: str
    jwt_secret: str

    mongodb_db: str = "noema"
    session_minutes: int = 60 * 24 * 7
    cors_origins: str = "http://localhost:5173"

    # Session cookie. Set COOKIE_SECURE=true when served over HTTPS.
    cookie_name: str = "noema_session"
    cookie_secure: bool = False
    cookie_samesite: str = "lax"

    @field_validator("jwt_secret")
    @classmethod
    def strong_secret(cls, v: str) -> str:
        if len(v) < 32 or "change-me" in v:
            raise ValueError("JWT_SECRET must be a random string of 32+ characters (openssl rand -hex 32)")
        return v

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
