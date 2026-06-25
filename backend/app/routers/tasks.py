from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.deps import get_db
from app import crud, schemas

router = APIRouter(prefix="/api/v1", tags=["tasks"])


@router.get("/trackers/{tracker_id}/tasks", response_model=schemas.TaskListResponse)
async def list_tasks(
    tracker_id: str,
    include_completed: bool = Query(True),
    db: AsyncSession = Depends(get_db)
):
    db_tracker = await crud.get_tracker(db, tracker_id)
    if not db_tracker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracker not found")

    tasks = await crud.get_tasks(db, tracker_id, include_completed=include_completed)
    return {"data": [schemas.TaskResponse.model_validate(t) for t in tasks]}


@router.post("/trackers/{tracker_id}/tasks", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(tracker_id: str, task: schemas.TaskCreate, db: AsyncSession = Depends(get_db)):
    db_tracker = await crud.get_tracker(db, tracker_id)
    if not db_tracker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracker not found")

    db_task = await crud.create_task(db, task, tracker_id)
    return schemas.TaskResponse.model_validate(db_task)


@router.get("/tasks/{id}", response_model=schemas.TaskResponse)
async def get_task(id: str, db: AsyncSession = Depends(get_db)):
    db_task = await crud.get_task(db, id)
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    return schemas.TaskResponse.model_validate(db_task)


@router.patch("/tasks/{id}", response_model=schemas.TaskResponse)
async def update_task(id: str, task: schemas.TaskUpdate, db: AsyncSession = Depends(get_db)):
    db_task = await crud.get_task(db, id)
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    db_task = await crud.update_task(db, id, task)
    return schemas.TaskResponse.model_validate(db_task)


@router.delete("/tasks/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(id: str, db: AsyncSession = Depends(get_db)):
    db_task = await crud.get_task(db, id)
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    await crud.delete_task(db, id)
