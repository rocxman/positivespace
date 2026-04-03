import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestSongsEndpoints:
    async def test_list_songs(self, auth_client: AsyncClient):
        response = await auth_client.get("/api/v1/songs")
        assert response.status_code == 200
        data = response.json()
        assert "songs" in data
        assert "total" in data
        assert "page" in data
        assert "per_page" in data

    async def test_list_songs_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/v1/songs")
        assert response.status_code == 403

    async def test_list_songs_pagination(self, auth_client: AsyncClient):
        response = await auth_client.get("/api/v1/songs?page=1&limit=2")
        assert response.status_code == 200
        data = response.json()
        assert "songs" in data
        assert data["page"] == 1
        assert data["per_page"] == 2

    async def test_list_songs_filter_by_search(self, auth_client: AsyncClient):
        response = await auth_client.get("/api/v1/songs?search=test")
        assert response.status_code == 200
        data = response.json()
        assert "songs" in data

    async def test_get_song_nonexistent(self, auth_client: AsyncClient):
        response = await auth_client.get(
            "/api/v1/songs/00000000-0000-0000-0000-000000000000",
        )
        assert response.status_code == 404


@pytest.mark.asyncio
class TestSongOperations:
    async def test_update_song_not_found(self, auth_client: AsyncClient):
        response = await auth_client.patch(
            "/api/v1/songs/00000000-0000-0000-0000-000000000000",
            json={"title": "New Title"},
        )
        assert response.status_code == 404

    async def test_delete_song_not_found(self, auth_client: AsyncClient):
        response = await auth_client.delete(
            "/api/v1/songs/00000000-0000-0000-0000-000000000000",
        )
        assert response.status_code == 404
