import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


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
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
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
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    songs = relationship("Song", back_populates="user", cascade="all, delete-orphan")
    generation_jobs = relationship("GenerationJob", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")


class Song(Base):
    __tablename__ = "songs"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    prompt = Column(Text, nullable=True)
    lyrics = Column(Text, nullable=True)
    genre = Column(String(50), nullable=True)
    mood = Column(String(50), nullable=True)
    tempo = Column(Integer, nullable=True)
    duration = Column(Integer, nullable=True)
    audio_url = Column(Text, nullable=True)
    stems_url = Column(JSON, nullable=True)
    cover_url = Column(Text, nullable=True)
    model_used = Column(String(50), nullable=True)
    is_public = Column(Boolean, default=False)
    play_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    license_type = Column(String(20), default=LicenseType.PERSONAL.value)
    status = Column(String(20), default=SongStatus.PENDING.value)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="songs")
    generation_jobs = relationship("GenerationJob", back_populates="song", cascade="all, delete-orphan")


class GenerationJob(Base):
    __tablename__ = "generation_jobs"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    song_id = Column(PG_UUID(as_uuid=True), ForeignKey("songs.id", ondelete="CASCADE"), nullable=True)
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
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(500), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="refresh_tokens")


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Integer, nullable=False)
    type = Column(String(20), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
