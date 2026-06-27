from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4
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


# Checklist CRUD


# Global undo stack (single-session, single-action undo)
_undo_stack: list[dict] = []


async def get_checklist(db: AsyncSession, checklist_id: str) -> Optional[models.Checklist]:
    result = await db.execute(
        select(models.Checklist).where(models.Checklist.id == checklist_id)
    )
    return result.scalars().first()


async def get_checklists(
    db: AsyncSession,
    is_template: Optional[bool] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> list[models.Checklist]:
    query = select(models.Checklist)

    if is_template is not None:
        query = query.where(models.Checklist.is_template == is_template)

    if search:
        query = query.where(models.Checklist.name.ilike(f"%{search}%"))

    query = query.order_by(models.Checklist.created_at.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()


async def create_checklist(
    db: AsyncSession, checklist: schemas.ChecklistCreate
) -> models.Checklist:
    items = []
    if checklist.items:
        items = [item.model_dump(mode='json') for item in checklist.items]
    elif checklist.is_template:
        # Fallback placeholder only when no items were provided
        items = [{"id": str(uuid4()), "name": "Device-1", "order": 0, "steps": []}]

    db_checklist = models.Checklist(
        name=checklist.name,
        is_template=checklist.is_template,
        items=items,
    )
    db.add(db_checklist)
    await db.commit()
    await db.refresh(db_checklist)
    return db_checklist


async def update_checklist(
    db: AsyncSession, checklist_id: str, checklist: schemas.ChecklistUpdate
) -> Optional[models.Checklist]:
    db_checklist = await get_checklist(db, checklist_id)
    if not db_checklist:
        return None

    if checklist.name is not None:
        db_checklist.name = checklist.name

    if checklist.items is not None:
        db_checklist.items = [item.model_dump(mode='json') for item in checklist.items]

    await db.commit()
    await db.refresh(db_checklist)
    return db_checklist


async def delete_checklist(db: AsyncSession, checklist_id: str) -> Optional[models.Checklist]:
    db_checklist = await get_checklist(db, checklist_id)
    if db_checklist:
        # Store in undo stack before deletion
        _undo_stack.clear()
        _undo_stack.append(
            {
                "checklist": {
                    "id": db_checklist.id,
                    "name": db_checklist.name,
                    "is_template": db_checklist.is_template,
                    "template_id": db_checklist.template_id,
                    "items": db_checklist.items,
                    "created_at": db_checklist.created_at.isoformat(),
                    "updated_at": db_checklist.updated_at.isoformat(),
                },
                "action": "delete",
            }
        )

        await db.delete(db_checklist)
        await db.commit()

    return db_checklist


async def clone_checklist(
    db: AsyncSession,
    template_id: str,
    checklist_name: str,
    device_list: list[str],
) -> Optional[models.Checklist]:
    """Clone a template into a new instance with the provided device list."""
    template = await get_checklist(db, template_id)
    if not template or not template.is_template:
        return None

    # Get template steps from the first item (placeholder)
    template_steps = []
    if template.items and len(template.items) > 0:
        template_steps = template.items[0].get("steps", [])

    # Create new items for each device
    new_items = []
    for idx, device_name in enumerate(device_list):
        new_item = {
            "id": str(uuid4()),
            "name": device_name,
            "order": idx,
            "steps": [
                {
                    "id": str(uuid4()),
                    "name": step.get("name"),
                    "type": step.get("type"),
                    "is_completed": False,
                    "completed_at": None,
                    "command": step.get("command"),
                    "display_text": step.get("display_text"),
                    "hide_command": step.get("hide_command", False),
                    "order": step_idx,
                }
                for step_idx, step in enumerate(template_steps)
            ],
        }
        new_items.append(new_item)

    # Create new checklist instance
    db_checklist = models.Checklist(
        name=checklist_name,
        is_template=False,
        template_id=template_id,
        items=new_items,
    )
    db.add(db_checklist)
    await db.commit()
    await db.refresh(db_checklist)
    return db_checklist


async def undo_last_delete(db: AsyncSession) -> Optional[models.Checklist]:
    """Restore the last deleted checklist."""
    if not _undo_stack:
        return None

    undo_data = _undo_stack.pop()
    checklist_data = undo_data["checklist"]

    # Parse ISO datetime strings back to datetime objects
    from datetime import datetime as dt
    created_at_str = checklist_data["created_at"]
    updated_at_str = checklist_data["updated_at"]

    # Handle both ISO format strings and datetime objects
    if isinstance(created_at_str, str):
        created_at = dt.fromisoformat(created_at_str.replace('Z', '+00:00'))
    else:
        created_at = created_at_str

    if isinstance(updated_at_str, str):
        updated_at = dt.fromisoformat(updated_at_str.replace('Z', '+00:00'))
    else:
        updated_at = updated_at_str

    db_checklist = models.Checklist(
        id=checklist_data["id"],
        name=checklist_data["name"],
        is_template=checklist_data["is_template"],
        template_id=checklist_data.get("template_id"),
        items=checklist_data.get("items", []),
        created_at=created_at,
        updated_at=updated_at,
    )
    db.add(db_checklist)
    await db.commit()
    await db.refresh(db_checklist)
    return db_checklist


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
