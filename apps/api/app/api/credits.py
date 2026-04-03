from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timedelta
from uuid import UUID
from typing import Optional
from app.db import get_db
from app.models import User, CreditTransaction
from app.schemas import CreditBalance, CreditHistoryItem, CreditHistoryResponse, MessageResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/credits", tags=["Credits"])


@router.get("/balance", response_model=CreditBalance)
async def get_credit_balance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.plan == "free":
        daily_reset = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        next_reset = daily_reset + timedelta(days=1)
        seconds_until_reset = int((next_reset - datetime.utcnow()).total_seconds())
    else:
        monthly_reset = current_user.credits_reset_at or datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if monthly_reset.month == 12:
            next_month = monthly_reset.replace(year=monthly_reset.year + 1, month=1)
        else:
            next_month = monthly_reset.replace(month=monthly_reset.month + 1)
        seconds_until_reset = int((next_month - datetime.utcnow()).total_seconds())

    return CreditBalance(
        balance=current_user.credits,
        plan=current_user.plan,
        seconds_until_reset=seconds_until_reset,
    )


@router.get("/history", response_model=CreditHistoryResponse)
async def get_credit_history(
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * limit
    
    result = await db.execute(
        select(CreditTransaction)
        .where(CreditTransaction.user_id == current_user.id)
        .order_by(desc(CreditTransaction.created_at))
        .offset(offset)
        .limit(limit)
    )
    transactions = result.scalars().all()
    
    count_result = await db.execute(
        select(CreditTransaction)
        .where(CreditTransaction.user_id == current_user.id)
    )
    total = len(count_result.scalars().all())
    
    items = [
        CreditHistoryItem(
            id=str(t.id),
            type=t.type,
            amount=t.amount,
            description=t.description,
            created_at=t.created_at.isoformat(),
        )
        for t in transactions
    ]
    
    return CreditHistoryResponse(
        history=items,
        total=total,
        page=page,
    )


@router.post("/purchase", response_model=CreditBalance)
async def purchase_credits(
    plan_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    plan_prices = {
        "starter": 29000,
        "pro": 79000,
        "unlimited": 199000,
    }
    
    plan_credits = {
        "starter": 100,
        "pro": 300,
        "unlimited": -1,
    }
    
    if plan_id not in plan_prices:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan"
        )
    
    credits_to_add = plan_credits[plan_id]
    
    if credits_to_add == -1:
        current_user.plan = "unlimited"
        current_user.credits = 999999
    else:
        if current_user.plan != "unlimited":
            current_user.credits += credits_to_add
        else:
            current_user.credits = 999999
    
    transaction = CreditTransaction(
        user_id=current_user.id,
        type="purchase",
        amount=credits_to_add if credits_to_add != -1 else 0,
        description=f"Purchase {plan_id} plan",
    )
    db.add(transaction)
    await db.commit()
    
    return CreditBalance(
        balance=current_user.credits,
        plan=current_user.plan,
        seconds_until_reset=0,
    )


async def reset_daily_credits(db: AsyncSession):
    """Reset daily free credits (called by Celery beat scheduler)"""
    free_users = await db.execute(
        select(User).where(User.plan == "free")
    )
    
    for user in free_users.scalars().all():
        transaction = CreditTransaction(
            user_id=user.id,
            type="daily_reset",
            amount=10,
            description="Daily free credits reset",
        )
        db.add(transaction)
    
    await db.commit()


async def reset_monthly_credits(db: AsyncSession):
    """Reset monthly credits based on plan (called by Celery beat scheduler)"""
    monthly_credits = {
        "starter": 100,
        "pro": 300,
    }
    
    for plan, amount in monthly_credits.items():
        users = await db.execute(
            select(User).where(User.plan == plan)
        )
        
        for user in users.scalars().all():
            transaction = CreditTransaction(
                user_id=user.id,
                type="monthly_reset",
                amount=amount,
                description=f"Monthly {plan} plan credits",
            )
            db.add(transaction)
    
    await db.commit()
