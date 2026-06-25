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


# List Response Wrappers
class TrackerListResponse(BaseModel):
    data: list[TrackerResponse]


class TaskListResponse(BaseModel):
    data: list[TaskResponse]


class NoteListResponse(BaseModel):
    data: list[NoteResponse]
