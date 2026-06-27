from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.deps import get_db
from app import crud, schemas

router = APIRouter(prefix="/api/v1/checklists", tags=["checklists"])


@router.get("", response_model=schemas.ChecklistListResponse)
async def list_checklists(
    is_template: bool | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    checklists = await crud.get_checklists(db, is_template=is_template, search=search, skip=skip, limit=limit)
    return {"data": [schemas.ChecklistResponse.model_validate(c) for c in checklists]}


@router.post("", response_model=schemas.ChecklistResponse, status_code=status.HTTP_201_CREATED)
async def create_checklist(
    checklist: schemas.ChecklistCreate,
    db: AsyncSession = Depends(get_db),
):
    db_checklist = await crud.create_checklist(db, checklist)
    return schemas.ChecklistResponse.model_validate(db_checklist)


@router.get("/{id}", response_model=schemas.ChecklistResponse)
async def get_checklist(id: str, db: AsyncSession = Depends(get_db)):
    db_checklist = await crud.get_checklist(db, id)
    if not db_checklist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist not found")

    return schemas.ChecklistResponse.model_validate(db_checklist)


@router.put("/{id}", response_model=schemas.ChecklistResponse)
async def update_checklist(
    id: str,
    checklist: schemas.ChecklistUpdate,
    db: AsyncSession = Depends(get_db),
):
    db_checklist = await crud.get_checklist(db, id)
    if not db_checklist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist not found")

    db_checklist = await crud.update_checklist(db, id, checklist)
    return schemas.ChecklistResponse.model_validate(db_checklist)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_checklist(id: str, db: AsyncSession = Depends(get_db)):
    db_checklist = await crud.get_checklist(db, id)
    if not db_checklist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist not found")

    await crud.delete_checklist(db, id)


@router.post("/{id}/clone", response_model=schemas.ChecklistResponse, status_code=status.HTTP_201_CREATED)
async def clone_checklist(
    id: str,
    request: schemas.CloneRequest,
    db: AsyncSession = Depends(get_db),
):
    template = await crud.get_checklist(db, id)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    if not template.is_template:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only clone templates, not instances",
        )

    cloned = await crud.clone_checklist(
        db,
        template_id=id,
        checklist_name=request.checklist_name,
        device_list=request.device_list,
    )

    if not cloned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to clone checklist",
        )

    return schemas.ChecklistResponse.model_validate(cloned)


@router.post("/undo", response_model=schemas.ChecklistResponse)
async def undo_last_delete(db: AsyncSession = Depends(get_db)):
    db_checklist = await crud.undo_last_delete(db)
    if not db_checklist:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nothing to undo",
        )

    return schemas.ChecklistResponse.model_validate(db_checklist)
