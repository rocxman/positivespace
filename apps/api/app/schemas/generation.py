from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=500)
    lyrics: Optional[str] = Field(None, max_length=2000)
    genre: Optional[Literal[
        "pop", "rock", "jazz", "rnb", "electronic", 
        "classical", "hiphop", "dangdut", "metal", "folk",
        "indie", "acoustic", "reggae", "blues", "country"
    ]] = None
    mood: Optional[Literal[
        "happy", "sad", "energetic", "calm", "dark",
        "romantic", "epic", "dreamy", "aggressive", "peaceful"
    ]] = None
    tempo: Optional[int] = Field(None, ge=40, le=200)
    duration: Optional[int] = Field(None, description="Duration in seconds: 15, 30, 60, 120, 240")
    model: Optional[Literal["yue", "musicgen", "ace-step"]] = "yue"
    variations: Optional[int] = Field(2, ge=1, le=4)
    instrumental_only: Optional[bool] = False
    reference_song_id: Optional[UUID] = None


class GenerateResponse(BaseModel):
    job_id: UUID
    song_id: UUID
    status: str
    estimated_time_seconds: int


class JobStatusResponse(BaseModel):
    job_id: UUID
    song_id: Optional[UUID]
    status: str
    progress: float
    audio_url: Optional[str] = None
    error_message: Optional[str] = None


class ExtendRequest(BaseModel):
    song_id: UUID
    duration: int = Field(30, ge=15, le=120)
