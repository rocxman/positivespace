from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class CreditBalance(BaseModel):
    balance: int
    plan: str
    seconds_until_reset: int


class CreditHistoryItem(BaseModel):
    id: str
    type: str
    amount: int
    description: str
    created_at: str


class CreditHistoryResponse(BaseModel):
    history: List[CreditHistoryItem]
    total: int
    page: int
