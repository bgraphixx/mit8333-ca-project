from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_INSECURE_SECRET_KEYS = {
    "development_secret_key_change_me_in_prod",
    "your-super-secret-key-change-in-production",
    "changeme",
    "secret",
}

class Settings(BaseSettings):
    PROJECT_NAME: str = "University Maintenance Platform"

    # Postgres
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_SERVER: str = "db"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "maintenance_db"

    # Security
    # Generate with `openssl rand -hex 32` and put it in .env.
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Comma-separated list of origins allowed to call this API with credentials.
    CORS_ORIGINS: str = "http://localhost:5173"

    # Cloudflare R2
    CLOUDFLARE_R2_ACCOUNT_ID: str | None = None
    CLOUDFLARE_R2_ACCESS_KEY_ID: str | None = None
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: str | None = None
    CLOUDFLARE_R2_BUCKET_NAME: str | None = None
    
    CLOUDFLARE_R2_PUBLIC_URL: str | None = None

    @field_validator("SECRET_KEY")
    @classmethod
    def _reject_placeholder_secret(cls, value: str) -> str:
        if not value or value.strip().lower() in _INSECURE_SECRET_KEYS:
            raise ValueError(
                "SECRET_KEY is missing or set to a known placeholder value. "
                "Generate a real one with `openssl rand -hex 32` and set it in .env."
            )
        return value

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def async_database_url(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def database_url(self) -> str:
        # Useful for sync operations like some alembic configs
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
