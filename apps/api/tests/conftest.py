import pytest
import asyncio
from typing import AsyncGenerator, Generator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text, JSON
import sys
import os
import uuid
from datetime import datetime
from unittest.mock import MagicMock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.security import get_password_hash, create_access_token

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

TestBase = declarative_base()


class TestUser(TestBase):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    avatar_url = Column(Text, nullable=True)
    plan = Column(String(20), default="free")
    credits = Column(Integer, default=50)
    credits_reset_at = Column(DateTime, nullable=True)
    stripe_customer_id = Column(String(100), nullable=True)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class TestRefreshToken(TestBase):
    __tablename__ = "refresh_tokens"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(500), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class TestSong(TestBase):
    __tablename__ = "songs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
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
    license_type = Column(String(20), default="personal")
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class TestCreditTransaction(TestBase):
    __tablename__ = "credit_transactions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(20), nullable=False)
    amount = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class TestGenerationJob(TestBase):
    __tablename__ = "generation_jobs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    song_id = Column(String(36), ForeignKey("songs.id", ondelete="CASCADE"), nullable=True)
    celery_task_id = Column(String(100), nullable=True)
    model = Column(String(50), default="yue")
    credits_used = Column(Integer, default=0)
    processing_time_ms = Column(Integer, nullable=True)
    gpu_type = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)
    status = Column(String(20), default="queued")
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


def create_mock_user(user_id: str = None, email: str = None, username: str = None, **kwargs):
    if user_id is None:
        user_id = str(uuid.uuid4())
    mock = MagicMock()
    mock.id = uuid.UUID(user_id)
    mock.email = email or "test@example.com"
    mock.username = username or "testuser"
    mock.hashed_password = kwargs.get("hashed_password", "")
    mock.full_name = kwargs.get("full_name")
    mock.avatar_url = kwargs.get("avatar_url")
    mock.plan = kwargs.get("plan", "free")
    mock.credits = kwargs.get("credits", 50)
    mock.credits_reset_at = kwargs.get("credits_reset_at")
    mock.stripe_customer_id = kwargs.get("stripe_customer_id")
    mock.is_verified = kwargs.get("is_verified", False)
    mock.is_active = kwargs.get("is_active", True)
    mock.is_superuser = kwargs.get("is_superuser", False)
    mock.created_at = kwargs.get("created_at", datetime.utcnow())
    mock.updated_at = kwargs.get("updated_at", datetime.utcnow())
    return mock


@pytest.fixture(scope="function")
def event_loop() -> Generator:
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with test_engine.begin() as conn:
        await conn.run_sync(TestBase.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(TestBase.metadata.drop_all)


@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    from app.main import app
    from app.db import get_db
    from app.api import deps

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
async def auth_client(db_session: AsyncSession, mock_user: MagicMock) -> AsyncGenerator[AsyncClient, None]:
    from app.main import app
    from app.db import get_db
    from app.api import deps

    async def override_get_db():
        yield db_session

    async def override_get_current_user():
        return mock_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[deps.get_current_user] = override_get_current_user

    transport = ASGITransport(app=app)
    token = create_access_token(str(mock_user.id))
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        ac.headers["Authorization"] = f"Bearer {token}"
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def test_user(db_session: AsyncSession) -> TestUser:
    user = TestUser(
        email="test@example.com",
        username="testuser",
        hashed_password=get_password_hash("testpassword123"),
        credits=50,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def auth_headers(test_user: TestUser) -> dict:
    token = create_access_token(str(test_user.id))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def mock_user() -> MagicMock:
    return create_mock_user(
        user_id="a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        email="test@example.com",
        username="testuser",
        hashed_password=get_password_hash("testpassword123"),
        credits=50,
        is_verified=True,
    )
