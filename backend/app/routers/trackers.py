from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.deps import get_db
from app import crud, schemas, models

router = APIRouter(prefix="/api/v1/trackers", tags=["trackers"])


@router.get("", response_model=schemas.TrackerListResponse)
async def list_trackers(db: AsyncSession = Depends(get_db)):
    trackers = await crud.get_trackers(db)
    result = []
    for tracker in trackers:
        open_count = await crud.count_open_tasks(db, tracker.id)
        result.append({
            **tracker.__dict__,
            "open_task_count": open_count
        })
    return {"data": [schemas.TrackerResponse(**item) for item in result]}


@router.post("", response_model=schemas.TrackerResponse, status_code=status.HTTP_201_CREATED)
async def create_tracker(tracker: schemas.TrackerCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(models.Tracker).where(models.Tracker.name == tracker.name)
    )
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Tracker with name '{tracker.name}' already exists"
        )

    db_tracker = await crud.create_tracker(db, tracker)
    open_count = await crud.count_open_tasks(db, db_tracker.id)
    return {
        **db_tracker.__dict__,
        "open_task_count": open_count
    }


@router.get("/{id}", response_model=schemas.TrackerDetailResponse)
async def get_tracker(id: str, db: AsyncSession = Depends(get_db)):
    db_tracker = await crud.get_tracker(db, id)
    if not db_tracker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracker not found")

    open_count = await crud.count_open_tasks(db, db_tracker.id)
    return {
        **db_tracker.__dict__,
        "open_task_count": open_count,
    }


@router.patch("/{id}", response_model=schemas.TrackerResponse)
async def update_tracker(id: str, tracker: schemas.TrackerUpdate, db: AsyncSession = Depends(get_db)):
    db_tracker = await crud.get_tracker(db, id)
    if not db_tracker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracker not found")

    if tracker.name and tracker.name != db_tracker.name:
        existing = await db.execute(
            select(models.Tracker).where(models.Tracker.name == tracker.name)
        )
        if existing.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Tracker with name '{tracker.name}' already exists"
            )

    db_tracker = await crud.update_tracker(db, id, tracker)
    open_count = await crud.count_open_tasks(db, db_tracker.id)
    return {
        **db_tracker.__dict__,
        "open_task_count": open_count
    }


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tracker(id: str, db: AsyncSession = Depends(get_db)):
    db_tracker = await crud.get_tracker(db, id)
    if not db_tracker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracker not found")

    await crud.delete_tracker(db, id)
