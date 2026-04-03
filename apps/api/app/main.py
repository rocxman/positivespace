from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi import Request
from sqlalchemy import text
import traceback
from app.core.config import settings
from app.db import init_db, close_db, get_db, engine, Base, AsyncSessionLocal
from app.models import User
from app.api import auth_router, songs_router, generate_router, credits_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Music Generation Platform",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(songs_router, prefix=settings.API_V1_PREFIX)
app.include_router(generate_router, prefix=settings.API_V1_PREFIX)
app.include_router(credits_router, prefix=settings.API_V1_PREFIX)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    tb = traceback.format_exc()
    return {
        "detail": str(exc),
        "type": type(exc).__name__,
        "traceback": tb[-1000:] if len(tb) > 1000 else tb,
    }


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/init-db")
async def init_database():
    """Manual endpoint to initialize database tables"""
    try:
        await init_db()
        return {"status": "success", "message": "Database tables created"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/test-db")
async def test_database():
    """Test database connection"""
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            return {"status": "success", "message": "Database connection OK"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/test-create-user")
async def test_create_user():
    """Simple test to create a user"""
    try:
        from app.core.security import get_password_hash
        
        async with AsyncSessionLocal() as db:
            user = User(
                email="test_simple@ps.ai",
                username="testsimple",
                hashed_password=get_password_hash("TestPass123!"),
                credits=50,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            return {"status": "success", "user_id": str(user.id)}
    except Exception as e:
        import traceback
        return {"status": "error", "detail": str(e), "trace": traceback.format_exc()[-500:]}
