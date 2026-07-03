from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field


# Tracker Schemas
class TrackerBase(BaseModel):
    name: str
    client_type: str


class TrackerCreate(TrackerBase):
    pass


class TrackerUpdate(BaseModel):
    name: Optional[str] = None
    client_type: Optional[str] = None


class TrackerResponse(TrackerBase):
    id: str
    open_task_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TrackerDetailResponse(TrackerResponse):
    pass


# Task Schemas
class TaskBase(BaseModel):
    title: str = Field(..., max_length=500)


class TaskCreate(TaskBase):
    severity: int = 10


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=500)
    is_completed: Optional[bool] = None
    sort_order: Optional[int] = None
    severity: Optional[int] = None


class TaskResponse(TaskBase):
    id: str
    tracker_id: str
    is_completed: bool
    completed_at: Optional[datetime]
    severity: int
    sort_order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# Note Schemas
class NoteBase(BaseModel):
    content: dict


class NoteCreate(NoteBase):
    title: Optional[str] = Field(None, max_length=200)
    note_date: Optional[date] = None


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    note_date: Optional[date] = None
    content: Optional[dict] = None


class NoteResponse(NoteBase):
    id: str
    task_id: str
    title: Optional[str]
    note_date: date
    content_text: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# Checklist Schemas
class ChecklistStep(BaseModel):
    id: str
    name: str = Field(..., max_length=500)
    type: str = Field(..., pattern="^(text|command)$")
    is_completed: bool = False
    completed_at: Optional[datetime] = None
    command: Optional[str] = None
    display_text: str = Field(..., max_length=500)
    instruction_text: Optional[str] = None
    hide_command: Optional[bool] = False
    order: int = 0


class ChecklistItem(BaseModel):
    id: str
    name: str = Field(..., max_length=255)
    order: int = 0
    steps: list[ChecklistStep] = []


class ChecklistBase(BaseModel):
    name: str = Field(..., max_length=255)
    is_template: bool = False


class ChecklistCreate(ChecklistBase):
    items: Optional[list[ChecklistItem]] = None


class ChecklistUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    items: Optional[list[ChecklistItem]] = None


class ChecklistResponse(ChecklistBase):
    id: str
    template_id: Optional[str] = None
    items: list[ChecklistItem] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ChecklistListResponse(BaseModel):
    data: list[ChecklistResponse]


class CloneRequest(BaseModel):
    checklist_name: str = Field(..., max_length=255)
    device_list: list[str] = Field(..., min_length=1)


# List Response Wrappers
class TrackerListResponse(BaseModel):
    data: list[TrackerResponse]


class TaskListResponse(BaseModel):
    data: list[TaskResponse]


class NoteListResponse(BaseModel):
    data: list[NoteResponse]


# ── Project Schemas ───────────────────────────────────────────────────────────

class ProjectStepReferenceBase(BaseModel):
    title: str = Field(..., max_length=255)
    url: str
    description: Optional[str] = None


class ProjectStepReferenceCreate(ProjectStepReferenceBase):
    pass


class ProjectStepReferenceUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    url: Optional[str] = None
    description: Optional[str] = None


class ProjectStepReferenceResponse(ProjectStepReferenceBase):
    id: str
    step_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectStepBase(BaseModel):
    title: str = Field(..., max_length=500)


class ProjectStepCreate(ProjectStepBase):
    pass


class ProjectStepUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=500)
    content: Optional[dict] = None
    content_text: Optional[str] = None


class ProjectStepResponse(ProjectStepBase):
    id: str
    project_id: str
    content: dict
    content_text: Optional[str]
    position: int
    is_completed: bool
    completed_at: Optional[datetime]
    references: list[ProjectStepReferenceResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectBase(BaseModel):
    title: str = Field(..., max_length=255)


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)


class ProjectResponse(ProjectBase):
    id: str
    steps: list[ProjectStepResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    data: list[ProjectResponse]


class StepReorderRequest(BaseModel):
    step_ids: list[str] = Field(..., min_length=1)
