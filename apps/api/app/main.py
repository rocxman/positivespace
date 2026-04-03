from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi import Request
from sqlalchemy import text
import traceback
import logging
from app.core.config import settings
from app.db import init_db, close_db, get_db, engine, Base, AsyncSessionLocal
from app.api import auth_router, songs_router, generate_router, credits_router

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
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
    tb = traceback.format_exc()
    logger.error(f"Global exception: {exc}\n{tb}")
    return {
        "detail": str(exc),
        "type": type(exc).__name__,
        "traceback": tb if settings.DEBUG else None,
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
    """Drop and recreate all tables"""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
        return {"status": "success", "message": "Database tables recreated"}
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
