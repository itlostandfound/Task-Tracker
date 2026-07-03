from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.deps import get_db
from app import crud, schemas

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


# ── Projects ──────────────────────────────────────────────────────────────────

@router.get("", response_model=schemas.ProjectListResponse)
async def list_projects(
    incomplete: bool = False,
    search: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    projects = await crud.get_projects(db, incomplete_only=incomplete, search=search, skip=skip, limit=limit)
    return {"data": [schemas.ProjectResponse.model_validate(p) for p in projects]}


@router.post("", response_model=schemas.ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(data: schemas.ProjectCreate, db: AsyncSession = Depends(get_db)):
    project = await crud.create_project(db, data)
    return schemas.ProjectResponse.model_validate(project)


@router.get("/{id}", response_model=schemas.ProjectResponse)
async def get_project(id: str, db: AsyncSession = Depends(get_db)):
    project = await crud.get_project(db, id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return schemas.ProjectResponse.model_validate(project)


@router.patch("/{id}", response_model=schemas.ProjectResponse)
async def update_project(id: str, data: schemas.ProjectUpdate, db: AsyncSession = Depends(get_db)):
    project = await crud.update_project(db, id, data)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return schemas.ProjectResponse.model_validate(project)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(id: str, db: AsyncSession = Depends(get_db)):
    project = await crud.get_project(db, id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    await crud.delete_project(db, id)


# ── Steps ─────────────────────────────────────────────────────────────────────

@router.get("/{id}/steps", response_model=list[schemas.ProjectStepResponse])
async def list_steps(id: str, db: AsyncSession = Depends(get_db)):
    project = await crud.get_project(db, id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return [schemas.ProjectStepResponse.model_validate(s) for s in project.steps]


@router.post("/{id}/steps", response_model=schemas.ProjectStepResponse, status_code=status.HTTP_201_CREATED)
async def add_step(id: str, data: schemas.ProjectStepCreate, db: AsyncSession = Depends(get_db)):
    project = await crud.get_project(db, id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    step = await crud.create_project_step(db, id, data)
    return schemas.ProjectStepResponse.model_validate(step)


# NOTE: reorder MUST be registered before /{step_id} to avoid the wildcard
# matching the literal string "reorder" as a step_id.
@router.patch("/{id}/steps/reorder", response_model=list[schemas.ProjectStepResponse])
async def reorder_steps(id: str, data: schemas.StepReorderRequest, db: AsyncSession = Depends(get_db)):
    steps = await crud.reorder_project_steps(db, id, data.step_ids)
    return [schemas.ProjectStepResponse.model_validate(s) for s in steps]


@router.patch("/{id}/steps/{step_id}", response_model=schemas.ProjectStepResponse)
async def update_step(id: str, step_id: str, data: schemas.ProjectStepUpdate, db: AsyncSession = Depends(get_db)):
    step = await crud.update_project_step(db, step_id, data)
    if not step:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Step not found")
    return schemas.ProjectStepResponse.model_validate(step)


@router.patch("/{id}/steps/{step_id}/complete", response_model=schemas.ProjectStepResponse)
async def toggle_complete(id: str, step_id: str, db: AsyncSession = Depends(get_db)):
    step = await crud.toggle_step_completion(db, step_id)
    if not step:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Step not found")
    return schemas.ProjectStepResponse.model_validate(step)


@router.delete("/{id}/steps/{step_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_step(id: str, step_id: str, db: AsyncSession = Depends(get_db)):
    deleted = await crud.delete_project_step(db, step_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Step not found")


# ── References ────────────────────────────────────────────────────────────────

@router.get(
    "/{id}/steps/{step_id}/references",
    response_model=list[schemas.ProjectStepReferenceResponse],
)
async def list_references(id: str, step_id: str, db: AsyncSession = Depends(get_db)):
    project = await crud.get_project(db, id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    step = next((s for s in project.steps if s.id == step_id), None)
    if not step:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Step not found")
    return [schemas.ProjectStepReferenceResponse.model_validate(r) for r in step.references]


@router.post(
    "/{id}/steps/{step_id}/references",
    response_model=schemas.ProjectStepReferenceResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_reference(
    id: str, step_id: str, data: schemas.ProjectStepReferenceCreate, db: AsyncSession = Depends(get_db)
):
    ref = await crud.create_step_reference(db, step_id, data)
    return schemas.ProjectStepReferenceResponse.model_validate(ref)


@router.patch(
    "/{id}/steps/{step_id}/references/{ref_id}",
    response_model=schemas.ProjectStepReferenceResponse,
)
async def update_reference(
    id: str, step_id: str, ref_id: str, data: schemas.ProjectStepReferenceUpdate, db: AsyncSession = Depends(get_db)
):
    ref = await crud.update_step_reference(db, ref_id, data)
    if not ref:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reference not found")
    return schemas.ProjectStepReferenceResponse.model_validate(ref)


@router.delete("/{id}/steps/{step_id}/references/{ref_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reference(id: str, step_id: str, ref_id: str, db: AsyncSession = Depends(get_db)):
    deleted = await crud.delete_step_reference(db, ref_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reference not found")
