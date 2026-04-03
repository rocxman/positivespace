import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestCreditsEndpoints:
    async def test_get_credit_balance(self, auth_client: AsyncClient):
        response = await auth_client.get("/api/v1/credits/balance")
        assert response.status_code == 200
        data = response.json()
        assert "balance" in data
        assert "plan" in data
        assert data["balance"] == 50

    async def test_get_credit_balance_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/v1/credits/balance")
        assert response.status_code == 403

    async def test_get_credit_history(self, auth_client: AsyncClient):
        response = await auth_client.get("/api/v1/credits/history")
        assert response.status_code == 200
        data = response.json()
        assert "history" in data
        assert "total" in data
        assert "page" in data

    async def test_get_credit_history_pagination(self, auth_client: AsyncClient):
        response = await auth_client.get(
            "/api/v1/credits/history?page=1&limit=10",
        )
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1

    async def test_purchase_credits_invalid_plan(self, auth_client: AsyncClient):
        response = await auth_client.post(
            "/api/v1/credits/purchase?plan_id=invalid",
        )
        assert response.status_code == 400
        assert "invalid" in response.json()["detail"].lower()


@pytest.mark.asyncio
class TestCreditPurchase:
    async def test_purchase_credits_starter(self, auth_client: AsyncClient):
        response = await auth_client.post(
            "/api/v1/credits/purchase?plan_id=starter",
        )
        assert response.status_code == 200
        data = response.json()
        assert data["balance"] > 50
