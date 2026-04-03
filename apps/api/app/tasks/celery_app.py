from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "positivespace",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.music_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=600,
    task_soft_time_limit=540,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=100,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
)

celery_app.conf.beat_schedule = {
    "reset-monthly-credits": {
        "task": "app.tasks.credit_tasks.reset_monthly_credits",
        "schedule": crontab(day_of_month=1, hour=0, minute=0),
    },
    "reset-daily-credits": {
        "task": "app.tasks.credit_tasks.reset_daily_credits",
        "schedule": crontab(hour=0, minute=0),
    },
    "cleanup-old-jobs": {
        "task": "app.tasks.cleanup_tasks.cleanup_old_jobs",
        "schedule": crontab(hour=2, minute=0),
    },
}


@celery_app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
