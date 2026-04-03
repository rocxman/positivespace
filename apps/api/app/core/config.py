from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=False,
    )

    # App
    APP_NAME: str = "PositiveSpace API"
    APP_VERSION: str = "0.1.0"
    APP_ENV: str = "development"
    DEBUG: bool = True
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]
    
    # Database - PostgreSQL for production (Supabase)
    DATABASE_URL: str = "postgresql+asyncpg://postgres:[MANDAwildi14]@db.uyxfdmrjycididzakbre.supabase.co:5432/postgres"
    DATABASE_SYNC_URL: str = "postgresql://postgres:[MANDAwildi14]@db.uyxfdmrjycididzakbre.supabase.co:5432/postgres"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # Cloudflare R2
    R2_ACCOUNT_ID: Optional[str] = None
    R2_ACCESS_KEY_ID: Optional[str] = None
    R2_SECRET_ACCESS_KEY: Optional[str] = None
    R2_BUCKET_NAME: str = "positivespace"
    R2_PUBLIC_URL: Optional[str] = None
    R2_ENDPOINT: Optional[str] = None
    R2_ENDPOINT_URL: Optional[str] = None
    
    # AI Services
    HUGGINGFACE_TOKEN: Optional[str] = None
    MODAL_TOKEN: Optional[str] = None
    REPLICATE_API_TOKEN: Optional[str] = None
    
    # Email
    RESEND_API_KEY: Optional[str] = None
    EMAIL_FROM: str = "noreply@positivespace.ai"
    
    # Stripe
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    # Midtrans
    MIDTRANS_SERVER_KEY: Optional[str] = None
    MIDTRANS_IS_PRODUCTION: bool = False
    
    # Sentry
    SENTRY_DSN: Optional[str] = None
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    # Supabase
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None
    
    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"
    
    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"


settings = Settings()
