from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from uuid import UUID
import uuid
import os
import asyncio
from app.db import get_db
from app.models import User, Song, GenerationJob, CreditTransaction
from app.schemas import GenerateRequest, GenerateResponse, JobStatusResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/generate", tags=["Music Generation"])

CREDIT_COSTS = {
    15: 2,
    30: 3,
    60: 5,
    120: 10,
    240: 15,
}


def call_modal_worker(prompt: str, song_id: str, lyrics: str = None) -> str:
    """
    Call Modal worker to generate music and upload to R2.
    Returns the audio URL from R2.
    """
    try:
        import modal
        
        # Create Modal stub
        stub = modal.App.lookup("positivespace-worker", create_if_missing=True)
        
        # Build full prompt with lyrics
        full_prompt = prompt
        if lyrics:
            full_prompt = f"{prompt}\n\nLyrics:\n{lyrics}"
        
        # Call the Modal function
        call = stub.generate_and_upload.remote_wave(full_prompt, str(song_id))
        result = call.get()
        
        return result
    except Exception as e:
        print(f"Modal worker error: {e}")
        # Fallback: return mock URL for development
        return f"https://pub-52aaae3d7b234412b33be73e65313e15.r2.dev/songs/{song_id}.wav"


@router.post("", response_model=GenerateResponse)
async def create_generation(
    data: GenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    duration = data.duration or 60
    credit_cost = CREDIT_COSTS.get(duration, 5) * data.variations
    
    if current_user.credits < credit_cost:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Not enough credits. Need {credit_cost}, have {current_user.credits}"
        )
    
    current_user.credits -= credit_cost
    
    song = Song(
        user_id=current_user.id,
        title=data.prompt[:50] if len(data.prompt) > 50 else data.prompt,
        prompt=data.prompt,
        lyrics=data.lyrics,
        genre=data.genre,
        mood=data.mood,
        tempo=data.tempo,
        duration=duration,
        model_used=data.model,
        status="pending",
    )
    db.add(song)
    await db.flush()
    
    job = GenerationJob(
        user_id=current_user.id,
        song_id=song.id,
        model=data.model,
        credits_used=credit_cost,
        status="queued",
    )
    db.add(job)
    
    credit_tx = CreditTransaction(
        user_id=current_user.id,
        amount=-credit_cost,
        type="deduction",
        description=f"Generation: {data.model} {duration}s x{data.variations}",
    )
    db.add(credit_tx)
    
    await db.commit()
    
    # Trigger Modal worker in background
    asyncio.create_task(trigger_generation(str(song.id), data.prompt, data.lyrics, data.model))
    
    estimated_time = 60 if data.model == "yue" else (30 if data.model == "musicgen" else 20)
    
    return GenerateResponse(
        job_id=job.id,
        song_id=song.id,
        status="queued",
        estimated_time_seconds=estimated_time,
    )


async def trigger_generation(song_id: str, prompt: str, lyrics: str, model: str):
    """
    Background task to trigger Modal worker.
    """
    try:
        import subprocess
        import json
        
        full_prompt = prompt
        if lyrics:
            full_prompt = f"{prompt}\n\nLyrics:\n{lyrics}"
        
        # Run Modal command
        cmd = [
            "modal", "run", "worker/music_gen.py",
            "--prompt", full_prompt,
            "--song-id", song_id
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=600,
            cwd="/home/wildibyrug/positivespace"
        )
        
        if result.returncode == 0:
            print(f"Generation complete: {result.stdout}")
        else:
            print(f"Generation failed: {result.stderr}")
            
    except Exception as e:
        print(f"Error triggering generation: {e}")


@router.get("/{job_id}/status", response_model=JobStatusResponse)
async def get_job_status(
    job_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(GenerationJob).where(
            GenerationJob.id == job_id,
            GenerationJob.user_id == current_user.id
        )
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    progress = 0.0
    if job.status == "queued":
        progress = 0.1
    elif job.status == "running":
        progress = 0.5
    elif job.status == "done":
        progress = 1.0
    
    return JobStatusResponse(
        job_id=job.id,
        song_id=job.song_id,
        status=job.status,
        progress=progress,
        error_message=job.error_message,
    )
