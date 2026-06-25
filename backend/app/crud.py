from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app import models, schemas


# Tracker CRUD


async def get_tracker(db: AsyncSession, tracker_id: str) -> Optional[models.Tracker]:
    result = await db.execute(
        select(models.Tracker).where(models.Tracker.id == tracker_id)
    )
    return result.scalars().first()


async def get_trackers(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[models.Tracker]:
    result = await db.execute(
        select(models.Tracker)
        .order_by(models.Tracker.name)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def create_tracker(db: AsyncSession, tracker: schemas.TrackerCreate) -> models.Tracker:
    db_tracker = models.Tracker(
        name=tracker.name,
        client_type=tracker.client_type,
    )
    db.add(db_tracker)
    await db.commit()
    await db.refresh(db_tracker)
    return db_tracker


async def update_tracker(db: AsyncSession, tracker_id: str, tracker: schemas.TrackerUpdate) -> Optional[models.Tracker]:
    db_tracker = await get_tracker(db, tracker_id)
    if not db_tracker:
        return None

    if tracker.name is not None:
        db_tracker.name = tracker.name
    if tracker.client_type is not None:
        db_tracker.client_type = tracker.client_type

    await db.commit()
    await db.refresh(db_tracker)
    return db_tracker


async def delete_tracker(db: AsyncSession, tracker_id: str) -> Optional[models.Tracker]:
    db_tracker = await get_tracker(db, tracker_id)
    if db_tracker:
        await db.delete(db_tracker)
        await db.commit()
    return db_tracker


# Task CRUD


async def get_task(db: AsyncSession, task_id: str) -> Optional[models.Task]:
    result = await db.execute(select(models.Task).where(models.Task.id == task_id))
    return result.scalars().first()


async def get_tasks(db: AsyncSession, tracker_id: str, skip: int = 0, limit: int = 100, include_completed: bool = True) -> list[models.Task]:
    query = select(models.Task).where(models.Task.tracker_id == tracker_id)

    if not include_completed:
        query = query.where(models.Task.is_completed == False)

    query = query.order_by(models.Task.sort_order).offset(skip).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()


async def create_task(db: AsyncSession, task: schemas.TaskCreate, tracker_id: str) -> models.Task:
    db_task = models.Task(
        tracker_id=tracker_id,
        title=task.title,
        severity=task.severity,
    )
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    return db_task


async def update_task(db: AsyncSession, task_id: str, task: schemas.TaskUpdate) -> Optional[models.Task]:
    db_task = await get_task(db, task_id)
    if not db_task:
        return None

    if task.title is not None:
        db_task.title = task.title
    if task.severity is not None:
        db_task.severity = task.severity
    if task.sort_order is not None:
        db_task.sort_order = task.sort_order
    if task.is_completed is not None:
        db_task.is_completed = task.is_completed
        if task.is_completed:
            db_task.completed_at = datetime.now(timezone.utc)
        else:
            db_task.completed_at = None

    await db.commit()
    await db.refresh(db_task)
    return db_task


async def delete_task(db: AsyncSession, task_id: str) -> Optional[models.Task]:
    db_task = await get_task(db, task_id)
    if db_task:
        await db.delete(db_task)
        await db.commit()
    return db_task


# Note CRUD


async def get_note(db: AsyncSession, note_id: str) -> Optional[models.Note]:
    result = await db.execute(select(models.Note).where(models.Note.id == note_id))
    return result.scalars().first()


async def get_notes(db: AsyncSession, task_id: str, skip: int = 0, limit: int = 100) -> list[models.Note]:
    result = await db.execute(
        select(models.Note)
        .where(models.Note.task_id == task_id)
        .order_by(models.Note.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


_BLOCK_NODE_TYPES = {"paragraph", "heading", "listItem", "blockquote", "codeBlock"}


def _extract_content_text(content: dict | None) -> str | None:
    if not content:
        return None

    if "content" not in content and isinstance(content.get("text"), str):
        return content["text"] or None

    def render(node: dict) -> str:
        if node.get("type") == "text":
            return node.get("text") or ""
        return "".join(render(c) for c in (node.get("content") or []))

    lines: list[str] = []

    def walk(node: dict) -> None:
        if node.get("type") in _BLOCK_NODE_TYPES:
            text = render(node)
            if text:
                lines.append(text)
        else:
            for child in node.get("content") or []:
                walk(child)

    walk(content)
    result = "\n".join(lines).strip()
    return result or None


async def create_note(db: AsyncSession, note: schemas.NoteCreate, task_id: str) -> models.Note:
    from datetime import date
    db_note = models.Note(
        task_id=task_id,
        title=note.title,
        note_date=note.note_date or date.today(),
        content=note.content,
        content_text=_extract_content_text(note.content),
    )
    db.add(db_note)
    await db.commit()
    await db.refresh(db_note)
    return db_note


async def update_note(db: AsyncSession, note_id: str, note: schemas.NoteUpdate) -> Optional[models.Note]:
    db_note = await get_note(db, note_id)
    if not db_note:
        return None

    if "title" in note.model_fields_set:
        db_note.title = note.title
    if note.note_date is not None:
        db_note.note_date = note.note_date
    if note.content is not None:
        db_note.content = note.content
        db_note.content_text = _extract_content_text(note.content)

    await db.commit()
    await db.refresh(db_note)
    return db_note


async def delete_note(db: AsyncSession, note_id: str) -> Optional[models.Note]:
    db_note = await get_note(db, note_id)
    if db_note:
        await db.delete(db_note)
        await db.commit()
    return db_note


# Helper functions


async def count_open_tasks(db: AsyncSession, tracker_id: str) -> int:
    result = await db.execute(
        select(func.count(models.Task.id)).where(
            and_(
                models.Task.tracker_id == tracker_id,
                models.Task.is_completed == False,
            )
        )
    )
    return result.scalar() or 0
