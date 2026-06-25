from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.deps import get_db
from app import crud, schemas

router = APIRouter(prefix="/api/v1", tags=["notes"])


@router.get("/tasks/{task_id}/notes", response_model=schemas.NoteListResponse)
async def list_notes(task_id: str, db: AsyncSession = Depends(get_db)):
    db_task = await crud.get_task(db, task_id)
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    notes = await crud.get_notes(db, task_id)
    return {"data": [schemas.NoteResponse.model_validate(n) for n in notes]}


@router.post("/tasks/{task_id}/notes", response_model=schemas.NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(task_id: str, note: schemas.NoteCreate, db: AsyncSession = Depends(get_db)):
    db_task = await crud.get_task(db, task_id)
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    db_note = await crud.create_note(db, note, task_id)
    return schemas.NoteResponse.model_validate(db_note)


@router.get("/notes/{id}", response_model=schemas.NoteResponse)
async def get_note(id: str, db: AsyncSession = Depends(get_db)):
    db_note = await crud.get_note(db, id)
    if not db_note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    return schemas.NoteResponse.model_validate(db_note)


@router.patch("/notes/{id}", response_model=schemas.NoteResponse)
async def update_note(id: str, note: schemas.NoteUpdate, db: AsyncSession = Depends(get_db)):
    db_note = await crud.get_note(db, id)
    if not db_note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    db_note = await crud.update_note(db, id, note)
    return schemas.NoteResponse.model_validate(db_note)


@router.delete("/notes/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(id: str, db: AsyncSession = Depends(get_db)):
    db_note = await crud.get_note(db, id)
    if not db_note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    await crud.delete_note(db, id)
