from app.api.auth import router as auth_router
from app.api.songs import router as songs_router
from app.api.generate import router as generate_router
from app.api.credits import router as credits_router

__all__ = ["auth_router", "songs_router", "generate_router", "credits_router"]
