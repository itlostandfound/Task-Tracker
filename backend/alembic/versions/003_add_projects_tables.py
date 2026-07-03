"""Add projects tables

Revision ID: 003_projects
Revises: 002_checklists
Create Date: 2026-07-03 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '003_projects'
down_revision = '002_checklists'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'projects',
        sa.Column('id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_projects_created_at', 'projects', ['created_at'])
    op.create_index('ix_projects_title', 'projects', ['title'])

    op.create_table(
        'project_steps',
        sa.Column('id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('content', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('content_text', sa.Text(), nullable=True),
        sa.Column('position', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_project_steps_project_position', 'project_steps', ['project_id', 'position'])

    op.create_table(
        'project_step_references',
        sa.Column('id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('step_id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('url', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['step_id'], ['project_steps.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_project_step_references_step_id', 'project_step_references', ['step_id'])


def downgrade() -> None:
    op.drop_index('ix_project_step_references_step_id', table_name='project_step_references')
    op.drop_table('project_step_references')
    op.drop_index('ix_project_steps_project_position', table_name='project_steps')
    op.drop_table('project_steps')
    op.drop_index('ix_projects_title', table_name='projects')
    op.drop_index('ix_projects_created_at', table_name='projects')
    op.drop_table('projects')
