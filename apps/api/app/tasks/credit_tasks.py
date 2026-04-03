import logging
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.credit_tasks.reset_monthly_credits")
def reset_monthly_credits():
    """
    Reset credits for all users at the start of each month
    Credits are reset based on their subscription plan
    """
    from app.db import AsyncSessionLocal
    from app.models import User
    
    async def _reset():
        session: AsyncSession = AsyncSessionLocal()
        try:
            # Get current month start
            now = datetime.utcnow()
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # Define credits by plan
            plan_credits = {
                "free": 50,
                "pro": 500,
                "premium": 2000,
                "enterprise": 10000,
            }
            
            # Get all active users
            result = await session.execute(
                select(User).where(User.is_active == True)
            )
            users = result.scalars().all()
            
            for user in users:
                credits_to_add = plan_credits.get(user.plan, 50)
                user.credits = credits_to_add
                user.credits_reset_at = month_start
                
                logger.info(f"Reset credits for user {user.id}: {credits_to_add}")
            
            await session.commit()
            logger.info(f"Monthly credits reset for {len(users)} users")
            
        except Exception as e:
            logger.exception(f"Error resetting monthly credits: {e}")
        finally:
            await session.close()
    
    from app.db import engine
    import asyncio
    
    async def run():
        async with engine.begin() as conn:
            await conn.run_sync(lambda: None)
    
    asyncio.run(_reset())


@celery_app.task(name="app.tasks.credit_tasks.reset_daily_credits")
def reset_daily_credits():
    """
    Reset daily free credits for free tier users
    """
    from app.db import AsyncSessionLocal
    from app.models import User
    
    async def _reset():
        session: AsyncSessionLocal()
        try:
            # Reset free users who haven't used daily credits
            result = await session.execute(
                select(User).where(
                    User.is_active == True,
                    User.plan == "free",
                )
            )
            users = result.scalars().all()
            
            for user in users:
                # Add 10 daily credits
                user.credits = min(user.credits + 10, 50)
                
                logger.info(f"Daily reset for user {user.id}: credits now {user.credits}")
            
            await session.commit()
            logger.info(f"Daily credits reset for {len(users)} free users")
            
        except Exception as e:
            logger.exception(f"Error resetting daily credits: {e}")
        finally:
            await session.close()
    
    import asyncio
    asyncio.run(_reset())


@celery_app.task(name="app.tasks.cleanup_tasks.cleanup_old_jobs")
def cleanup_old_jobs():
    """
    Clean up old completed/failed jobs to save database space
    Keeps jobs for 30 days
    """
    from app.db import AsyncSessionLocal
    from app.models import GenerationJob
    
    async def _cleanup():
        session: AsyncSessionLocal()
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=30)
            
            result = await session.execute(
                delete(GenerationJob).where(
                    GenerationJob.status.in_(["done", "failed"]),
                    GenerationJob.created_at < cutoff_date,
                )
            )
            
            await session.commit()
            logger.info(f"Cleaned up old jobs: {result.rowcount} deleted")
            
        except Exception as e:
            logger.exception(f"Error cleaning up old jobs: {e}")
        finally:
            await session.close()
    
    import asyncio
    asyncio.run(_cleanup())
