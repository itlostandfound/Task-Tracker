from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.deps import get_db
from app import crud, schemas, models

router = APIRouter(prefix="/api/v1/trackers", tags=["trackers"])


def _tracker_to_response(tracker: models.Tracker, open_count: int) -> schemas.TrackerResponse:
    return schemas.TrackerResponse(
        id=tracker.id,
        name=tracker.name,
        client_type=tracker.client_type,
        created_at=tracker.created_at,
        updated_at=tracker.updated_at,
        open_task_count=open_count,
    )


@router.get("", response_model=schemas.TrackerListResponse)
async def list_trackers(db: AsyncSession = Depends(get_db)):
    open_task_subq = (
        select(models.Task.tracker_id, func.count(models.Task.id).label("open_count"))
        .where(models.Task.is_completed == False)
        .group_by(models.Task.tracker_id)
        .subquery()
    )

    result = await db.execute(
        select(models.Tracker, func.coalesce(open_task_subq.c.open_count, 0).label("open_task_count"))
        .outerjoin(open_task_subq, models.Tracker.id == open_task_subq.c.tracker_id)
        .order_by(models.Tracker.name)
    )

    rows = result.all()
    return {"data": [_tracker_to_response(tracker, open_count) for tracker, open_count in rows]}


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
    return _tracker_to_response(db_tracker, 0)


@router.get("/{id}", response_model=schemas.TrackerDetailResponse)
async def get_tracker(id: str, db: AsyncSession = Depends(get_db)):
    db_tracker = await crud.get_tracker(db, id)
    if not db_tracker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracker not found")

    open_count = await crud.count_open_tasks(db, db_tracker.id)
    return _tracker_to_response(db_tracker, open_count)


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
    return _tracker_to_response(db_tracker, open_count)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tracker(id: str, db: AsyncSession = Depends(get_db)):
    db_tracker = await crud.get_tracker(db, id)
    if not db_tracker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracker not found")

    await crud.delete_tracker(db, id)
