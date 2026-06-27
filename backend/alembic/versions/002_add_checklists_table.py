"""Add checklists table

Revision ID: 002_checklists
Revises: 001_initial
Create Date: 2026-06-25 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '002_checklists'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create checklists table
    op.create_table(
        'checklists',
        sa.Column('id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('is_template', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('template_id', postgresql.UUID(as_uuid=False), nullable=True),
        sa.Column('items', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['template_id'], ['checklists.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_checklists_is_template_name', 'checklists', ['is_template', 'name'])
    op.create_index('ix_checklists_created_at', 'checklists', ['created_at'])


def downgrade() -> None:
    op.drop_index('ix_checklists_created_at', table_name='checklists')
    op.drop_index('ix_checklists_is_template_name', table_name='checklists')
    op.drop_table('checklists')
