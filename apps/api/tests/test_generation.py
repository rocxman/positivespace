import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestGenerationEndpoints:
    async def test_start_generation(self, auth_client: AsyncClient):
        response = await auth_client.post(
            "/api/v1/generate",
            json={
                "prompt": "A happy upbeat pop song with tropical vibes",
                "genre": "pop",
                "mood": "happy",
                "model": "yue",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "job_id" in data
        assert data["status"] == "queued"

    async def test_start_generation_with_lyrics(self, auth_client: AsyncClient):
        response = await auth_client.post(
            "/api/v1/generate",
            json={
                "prompt": "Verse: Walking down the street...",
                "lyrics": "[Verse]\nWalking down the street today\nSun is shining bright",
                "genre": "rock",
                "mood": "energetic",
                "model": "yue",
            },
        )
        assert response.status_code == 200

    async def test_generation_requires_auth(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/generate",
            json={
                "prompt": "A song",
                "genre": "pop",
                "mood": "happy",
                "model": "yue",
            },
        )
        assert response.status_code == 403

    async def test_get_nonexistent_job_status(self, auth_client: AsyncClient):
        response = await auth_client.get(
            "/api/v1/generate/00000000-0000-0000-0000-000000000000/status",
        )
        assert response.status_code == 404


@pytest.mark.asyncio
class TestGenerationValidation:
    async def test_invalid_genre(self, auth_client: AsyncClient):
        response = await auth_client.post(
            "/api/v1/generate",
            json={
                "prompt": "A song",
                "genre": "invalid_genre",
                "mood": "happy",
                "model": "yue",
            },
        )
        assert response.status_code == 422

    async def test_invalid_model(self, auth_client: AsyncClient):
        response = await auth_client.post(
            "/api/v1/generate",
            json={
                "prompt": "A song",
                "genre": "pop",
                "mood": "happy",
                "model": "invalid_model",
            },
        )
        assert response.status_code == 422

    async def test_empty_prompt(self, auth_client: AsyncClient):
        response = await auth_client.post(
            "/api/v1/generate",
            json={
                "prompt": "",
                "genre": "pop",
                "mood": "happy",
                "model": "yue",
            },
        )
        assert response.status_code == 422

    async def test_missing_required_fields(self, auth_client: AsyncClient):
        response = await auth_client.post(
            "/api/v1/generate",
            json={
                "genre": "pop",
            },
        )
        assert response.status_code == 422
