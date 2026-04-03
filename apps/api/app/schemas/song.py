from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Literal
from datetime import datetime
from uuid import UUID


class StemUrls(BaseModel):
    vocals: Optional[str] = None
    drums: Optional[str] = None
    bass: Optional[str] = None
    melody: Optional[str] = None


class SongBase(BaseModel):
    title: str = Field(..., max_length=200)
    prompt: Optional[str] = Field(None, max_length=500)
    lyrics: Optional[str] = Field(None, max_length=2000)
    genre: Optional[str] = None
    mood: Optional[str] = None
    tempo: Optional[int] = Field(None, ge=40, le=200)
    duration: Optional[int] = None


class SongCreate(SongBase):
    pass


class SongUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    is_public: Optional[bool] = None
    genre: Optional[str] = None
    mood: Optional[str] = None


class SongResponse(SongBase):
    id: UUID
    user_id: UUID
    audio_url: Optional[str] = None
    stems_url: Optional[StemUrls] = None
    cover_url: Optional[str] = None
    model_used: Optional[str] = None
    is_public: bool
    play_count: int
    like_count: int
    license_type: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class SongListResponse(BaseModel):
    songs: List[SongResponse]
    total: int
    page: int
    per_page: int


class SongDetailResponse(BaseModel):
    song: SongResponse
