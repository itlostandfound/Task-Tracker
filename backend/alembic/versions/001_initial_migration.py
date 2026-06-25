"""Initial migration

Revision ID: 001_initial
Revises:
Create Date: 2026-05-19 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create trackers table
    op.create_table(
        'trackers',
        sa.Column('id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('client_type', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
    )
    op.create_index('ix_trackers_archived_at', 'trackers', ['archived_at'])
    op.create_index('ix_trackers_name', 'trackers', ['name'], unique=True)

    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('tracker_id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('severity', sa.Integer(), nullable=False, server_default='10'),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['tracker_id'], ['trackers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_tasks_tracker_completed', 'tasks', ['tracker_id', 'is_completed'])
    op.create_index('ix_tasks_tracker_sort', 'tasks', ['tracker_id', 'sort_order'])

    # Create notes table
    op.create_table(
        'notes',
        sa.Column('id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('task_id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('title', sa.String(200), nullable=True),
        sa.Column('note_date', sa.Date(), nullable=False, server_default=sa.func.current_date()),
        sa.Column('content', sa.JSON(), nullable=False),
        sa.Column('content_text', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_notes_task_created', 'notes', ['task_id', 'created_at'])


def downgrade() -> None:
    op.drop_index('ix_notes_task_created', table_name='notes')
    op.drop_table('notes')
    op.drop_index('ix_tasks_tracker_sort', table_name='tasks')
    op.drop_index('ix_tasks_tracker_completed', table_name='tasks')
    op.drop_table('tasks')
    op.drop_index('ix_trackers_name', table_name='trackers')
    op.drop_index('ix_trackers_archived_at', table_name='trackers')
    op.drop_table('trackers')
