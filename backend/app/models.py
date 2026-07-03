from datetime import datetime
from uuid import uuid4
from sqlalchemy import (
    String,
    Boolean,
    DateTime,
    Date,
    JSON,
    Integer,
    ForeignKey,
    Text,
    Index,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Tracker(Base):
    __tablename__ = "trackers"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    client_type: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now(), onupdate=func.now())
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    tasks: Mapped[list["Task"]] = relationship("Task", back_populates="tracker", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_trackers_archived_at", "archived_at"),
        Index("ix_trackers_name", "name", unique=True),
    )


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    tracker_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("trackers.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    severity: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now(), onupdate=func.now())

    tracker: Mapped["Tracker"] = relationship("Tracker", back_populates="tasks")
    notes: Mapped[list["Note"]] = relationship("Note", back_populates="task", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_tasks_tracker_completed", "tracker_id", "is_completed"),
        Index("ix_tasks_tracker_sort", "tracker_id", "sort_order"),
    )


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    task_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    note_date: Mapped[datetime] = mapped_column(Date, nullable=False, default=func.current_date())
    content: Mapped[dict] = mapped_column(JSON, nullable=False)
    content_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now(), onupdate=func.now())

    task: Mapped["Task"] = relationship("Task", back_populates="notes")

    __table_args__ = (
        Index("ix_notes_task_created", "task_id", "created_at"),
    )


class Checklist(Base):
    __tablename__ = "checklists"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_template: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    template_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("checklists.id", ondelete="SET NULL"), nullable=True)
    items: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("ix_checklists_is_template_name", "is_template", "name"),
        Index("ix_checklists_created_at", "created_at"),
    )


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now(), onupdate=func.now())

    steps: Mapped[list["ProjectStep"]] = relationship(
        "ProjectStep", back_populates="project", cascade="all, delete-orphan",
        order_by="ProjectStep.position",
    )

    __table_args__ = (
        Index("ix_projects_created_at", "created_at"),
        Index("ix_projects_title", "title"),
    )


class ProjectStep(Base):
    __tablename__ = "project_steps"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    project_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    content: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    content_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now(), onupdate=func.now())

    project: Mapped["Project"] = relationship("Project", back_populates="steps")
    references: Mapped[list["ProjectStepReference"]] = relationship(
        "ProjectStepReference", back_populates="step", cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("ix_project_steps_project_position", "project_id", "position"),
    )


class ProjectStepReference(Base):
    __tablename__ = "project_step_references"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    step_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("project_steps.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now(), onupdate=func.now())

    step: Mapped["ProjectStep"] = relationship("ProjectStep", back_populates="references")

    __table_args__ = (
        Index("ix_project_step_references_step_id", "step_id"),
    )
