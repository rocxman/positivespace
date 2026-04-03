from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from uuid import UUID
from app.db import get_db
from app.models import User, Song
from app.schemas import SongResponse, SongListResponse, SongUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/songs", tags=["Songs"])


@router.get("", response_model=SongListResponse)
async def list_songs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Song).where(Song.user_id == current_user.id)
    
    if search:
        query = query.where(Song.title.ilike(f"%{search}%"))
    
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.order_by(Song.created_at.desc())
    query = query.offset((page - 1) * limit).limit(limit)
    
    result = await db.execute(query)
    songs = result.scalars().all()
    
    return SongListResponse(
        songs=[SongResponse.model_validate(song) for song in songs],
        total=total,
        page=page,
        per_page=limit,
    )


@router.get("/{song_id}", response_model=SongResponse)
async def get_song(
    song_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Song).where(
            Song.id == song_id,
            Song.user_id == current_user.id
        )
    )
    song = result.scalar_one_or_none()
    
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    return SongResponse.model_validate(song)


@router.patch("/{song_id}", response_model=SongResponse)
async def update_song(
    song_id: UUID,
    data: SongUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Song).where(
            Song.id == song_id,
            Song.user_id == current_user.id
        )
    )
    song = result.scalar_one_or_none()
    
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(song, field, value)
    
    await db.commit()
    await db.refresh(song)
    
    return SongResponse.model_validate(song)


@router.delete("/{song_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_song(
    song_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Song).where(
            Song.id == song_id,
            Song.user_id == current_user.id
        )
    )
    song = result.scalar_one_or_none()
    
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    await db.delete(song)
    await db.commit()
