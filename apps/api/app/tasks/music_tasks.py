import asyncio
import logging
from uuid import UUID
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.tasks.celery_app import celery_app
from app.services.music_generator import (
    MusicGenerator,
    GenerationParams,
    ModelType,
)

logger = logging.getLogger(__name__)

music_generator = MusicGenerator(device="cpu")


@celery_app.task(bind=True, name="app.tasks.music_tasks.generate_music")
def generate_music(self, job_id: str, user_id: str, song_id: str):
    """
    Celery task to generate music using AI models
    
    Args:
        job_id: The generation job ID
        user_id: The user ID who requested the generation
        song_id: The song ID to update with the generated audio
    """
    from app.db import AsyncSessionLocal
    from app.models import GenerationJob, Song, JobStatus
    
    async def _generate():
        session: AsyncSession = AsyncSessionLocal()
        try:
            # Get job details
            result = await session.execute(
                select(GenerationJob).where(GenerationJob.id == UUID(job_id))
            )
            job = result.scalar_one_or_none()
            
            if not job:
                logger.error(f"Job {job_id} not found")
                return
            
            # Update job status to running
            job.status = JobStatus.RUNNING.value
            await session.commit()
            
            # Get song details
            result = await session.execute(
                select(Song).where(Song.id == UUID(song_id))
            )
            song = result.scalar_one_or_none()
            
            if not song:
                logger.error(f"Song {song_id} not found")
                job.status = JobStatus.FAILED.value
                job.error_message = "Song not found"
                await session.commit()
                return
            
            # Generate music
            model_type = ModelType(job.model) if job.model else ModelType.YUE
            
            params = GenerationParams(
                prompt=song.prompt or "",
                lyrics=song.lyrics,
                genre=song.genre,
                mood=song.mood,
                tempo=song.tempo,
                duration=song.duration or 60,
                model=model_type,
                instrumental_only=not song.lyrics,
            )
            
            # Generate the audio
            result_audio = await music_generator.generate(params)
            
            # Upload to R2 (placeholder)
            audio_url = await upload_to_r2(result_audio.audio_data, song_id)
            
            # Update song with audio URL
            song.audio_url = audio_url
            song.status = "done"
            
            # Update job as completed
            job.status = JobStatus.DONE.value
            job.completed_at = asyncio.utcnow()
            job.processing_time_ms = int(result_audio.duration * 1000)
            
            await session.commit()
            
            logger.info(f"Successfully generated music for song {song_id}")
            
        except Exception as e:
            logger.exception(f"Error generating music for job {job_id}")
            
            # Update job as failed
            job.status = JobStatus.FAILED.value
            job.error_message = str(e)
            await session.commit()
            
        finally:
            await session.close()
    
    # Run async code in event loop
    asyncio.run(_generate())


async def upload_to_r2(audio_data: bytes, song_id: str) -> str:
    """
    Upload generated audio to Cloudflare R2
    
    Returns the public URL of the uploaded file
    """
    from app.core.config import settings
    import boto3
    from datetime import datetime
    
    if not all([
        settings.R2_ACCOUNT_ID,
        settings.R2_ACCESS_KEY_ID,
        settings.R2_SECRET_ACCESS_KEY,
    ]):
        logger.warning("R2 not configured, using placeholder URL")
        return f"https://placeholder.r2.dev/songs/{song_id}.wav"
    
    try:
        s3 = boto3.client(
            "s3",
            endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.dev",
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        )
        
        filename = f"songs/{song_id}_{datetime.utcnow().timestamp()}.wav"
        
        s3.put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=filename,
            Body=audio_data,
            ContentType="audio/wav",
        )
        
        public_url = f"{settings.R2_PUBLIC_URL}/{filename}"
        return public_url
        
    except Exception as e:
        logger.error(f"Error uploading to R2: {e}")
        return f"https://placeholder.r2.dev/songs/{song_id}.wav"


@celery_app.task(name="app.tasks.music_tasks.generate_variations")
def generate_variations(self, song_id: str, count: int = 2):
    """
    Generate multiple variations of a song
    
    Args:
        song_id: The original song ID
        count: Number of variations to generate
    """
    # Implementation similar to generate_music
    # but creates multiple variations
    pass


@celery_app.task(name="app.tasks.music_tasks.extract_stems")
def extract_stems(self, song_id: str):
    """
    Extract audio stems (vocals, drums, bass, melody) from a song
    
    Args:
        song_id: The song ID to extract stems from
    """
    # Using Demucs for source separation
    # Implementation placeholder
    pass
