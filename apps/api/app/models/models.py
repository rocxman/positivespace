import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text, JSON, TypeDecorator
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type when available, otherwise uses String(36).
    """
    impl = String(36)
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            from sqlalchemy.dialects.postgresql import UUID
            return dialect.type_descriptor(UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            if isinstance(value, uuid.UUID):
                return str(value)
            return value

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(value)


class JSONType(TypeDecorator):
    """Platform-independent JSON type.
    Uses PostgreSQL's JSONB when available, otherwise uses JSON.
    """
    impl = JSON
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            from sqlalchemy.dialects.postgresql import JSONB
            return dialect.type_descriptor(JSONB())
        else:
            return dialect.type_descriptor(JSON())


class SubscriptionPlan(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"


class LicenseType(str, enum.Enum):
    PERSONAL = "personal"
    COMMERCIAL = "commercial"


class SongStatus(str, enum.Enum):
    PENDING = "pending"
    GENERATING = "generating"
    DONE = "done"
    FAILED = "failed"


class JobStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    DONE = "done"
    FAILED = "failed"


class GenerationModel(str, enum.Enum):
    YUE = "yue"
    MUSICGEN = "musicgen"
    ACE_STEP = "ace-step"


class User(Base):
    __tablename__ = "users"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    avatar_url = Column(Text, nullable=True)
    plan = Column(String(20), default=SubscriptionPlan.FREE.value)
    credits = Column(Integer, default=0)
    credits_reset_at = Column(DateTime, nullable=True)
    stripe_customer_id = Column(String(100), nullable=True)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    songs = relationship("Song", back_populates="user", cascade="all, delete-orphan")
    generation_jobs = relationship("GenerationJob", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")


class Song(Base):
    __tablename__ = "songs"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    prompt = Column(Text, nullable=True)
    lyrics = Column(Text, nullable=True)
    genre = Column(String(50), nullable=True)
    mood = Column(String(50), nullable=True)
    tempo = Column(Integer, nullable=True)
    duration = Column(Integer, nullable=True)
    audio_url = Column(Text, nullable=True)
    stems_url = Column(JSONType, nullable=True)
    cover_url = Column(Text, nullable=True)
    model_used = Column(String(50), nullable=True)
    is_public = Column(Boolean, default=False)
    play_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    license_type = Column(String(20), default=LicenseType.PERSONAL.value)
    status = Column(String(20), default=SongStatus.PENDING.value)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="songs")
    generation_jobs = relationship("GenerationJob", back_populates="song", cascade="all, delete-orphan")


class GenerationJob(Base):
    __tablename__ = "generation_jobs"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    song_id = Column(GUID(), ForeignKey("songs.id", ondelete="CASCADE"), nullable=True)
    celery_task_id = Column(String(100), nullable=True)
    model = Column(String(50), default=GenerationModel.YUE.value)
    credits_used = Column(Integer, default=0)
    processing_time_ms = Column(Integer, nullable=True)
    gpu_type = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)
    status = Column(String(20), default=JobStatus.QUEUED.value)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="generation_jobs")
    song = relationship("Song", back_populates="generation_jobs")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(500), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="refresh_tokens")


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Integer, nullable=False)
    type = Column(String(20), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
