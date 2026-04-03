import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pydantic import ValidationError


class TestUserSchemas:
    def test_user_create_valid(self):
        from app.schemas.user import UserCreate
        
        user = UserCreate(
            email="test@example.com",
            username="testuser",
            password="SecurePass123!"
        )
        
        assert user.email == "test@example.com"
        assert user.username == "testuser"

    def test_user_create_invalid_email(self):
        from app.schemas.user import UserCreate
        
        with pytest.raises(ValidationError):
            UserCreate(
                email="invalid-email",
                username="testuser",
                password="SecurePass123!"
            )

    def test_user_create_short_password(self):
        from app.schemas.user import UserCreate
        
        with pytest.raises(ValidationError):
            UserCreate(
                email="test@example.com",
                username="testuser",
                password="short"
            )

    def test_login_request_valid(self):
        from app.schemas.user import LoginRequest
        
        login = LoginRequest(
            email="test@example.com",
            password="password123"
        )
        
        assert login.email == "test@example.com"


class TestSongSchemas:
    def test_song_create_valid(self):
        from app.schemas.song import SongCreate
        
        song = SongCreate(
            title="My Song",
            genre="pop",
            mood="happy",
            duration=180
        )
        
        assert song.title == "My Song"
        assert song.genre == "pop"

    def test_song_create_minimal(self):
        from app.schemas.song import SongCreate
        
        song = SongCreate(title="Minimal Song")
        
        assert song.title == "Minimal Song"
        assert song.genre is None


class TestGenerationSchemas:
    def test_generate_request_valid(self):
        from app.schemas.generation import GenerateRequest
        
        request = GenerateRequest(
            prompt="A happy pop song",
            genre="pop",
            mood="happy",
            model="yue"
        )
        
        assert request.prompt == "A happy pop song"
        assert request.model == "yue"

    def test_generate_request_with_lyrics(self):
        from app.schemas.generation import GenerateRequest
        
        request = GenerateRequest(
            prompt="A rock song",
            lyrics="Verse 1: Hello world...",
            genre="rock",
            mood="energetic",
            model="musicgen"
        )
        
        assert request.lyrics is not None
        assert "Hello world" in request.lyrics

    def test_generate_request_invalid_model(self):
        from app.schemas.generation import GenerateRequest
        
        with pytest.raises(ValidationError):
            GenerateRequest(
                prompt="A song",
                model="invalid-model"
            )
