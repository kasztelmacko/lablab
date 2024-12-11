"""Edit replace id integers in all models to use UUID instead

Revision ID: d98dd8ec85a3
Revises: 9c0a54914c78
Create Date: 2024-07-19 04:08:04.000976

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'd98dd8ec85a3'
down_revision = '9c0a54914c78'
branch_labels = None
depends_on = None


def upgrade():
    # Ensure uuid-ossp extension is available
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # Add new UUID columns with default UUID values
    op.add_column('user', sa.Column('new_user_id', postgresql.UUID(as_uuid=True), default=sa.text('uuid_generate_v4()')))
    op.add_column('item', sa.Column('new_item_id', postgresql.UUID(as_uuid=True), default=sa.text('uuid_generate_v4()')))
    op.add_column('item', sa.Column('new_current_owner_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('room', sa.Column('new_room_id', postgresql.UUID(as_uuid=True), default=sa.text('uuid_generate_v4()')))
    op.add_column('room', sa.Column('new_room_owner_id', postgresql.UUID(as_uuid=True), nullable=True))

    # Populate the new UUID columns
    op.execute('UPDATE "user" SET new_user_id = uuid_generate_v4()')
    op.execute('UPDATE item SET new_item_id = uuid_generate_v4()')
    op.execute('UPDATE item SET new_current_owner_id = (SELECT new_user_id FROM "user" WHERE "user".id = item.current_owner_id)')
    op.execute('UPDATE room SET new_room_id = uuid_generate_v4()')
    op.execute('UPDATE room SET new_room_owner_id = (SELECT new_user_id FROM "user" WHERE "user".id = room.room_owner_id)')

    # Set the new UUID columns as not nullable
    op.alter_column('user', 'new_user_id', nullable=False)
    op.alter_column('item', 'new_item_id', nullable=False)
    op.alter_column('room', 'new_room_id', nullable=False)

    # Drop old columns and rename new columns
    op.drop_constraint('item_current_owner_id_fkey', 'item', type_='foreignkey')
    op.drop_column('item', 'current_owner_id')
    op.alter_column('item', 'new_current_owner_id', new_column_name='current_owner_id')

    op.drop_column('user', 'id')
    op.alter_column('user', 'new_user_id', new_column_name='user_id')

    op.drop_column('item', 'id')
    op.alter_column('item', 'new_item_id', new_column_name='item_id')

    op.drop_constraint('room_room_owner_id_fkey', 'room', type_='foreignkey')
    op.drop_column('room', 'room_owner_id')
    op.alter_column('room', 'new_room_owner_id', new_column_name='room_owner_id')

    op.drop_column('room', 'id')
    op.alter_column('room', 'new_room_id', new_column_name='room_id')

    # Create primary key constraints
    op.create_primary_key('user_pkey', 'user', ['user_id'])
    op.create_primary_key('item_pkey', 'item', ['item_id'])
    op.create_primary_key('room_pkey', 'room', ['room_id'])

    # Recreate foreign key constraints
    op.create_foreign_key('item_current_owner_id_fkey', 'item', 'user', ['current_owner_id'], ['user_id'])
    op.create_foreign_key('room_room_owner_id_fkey', 'room', 'user', ['room_owner_id'], ['user_id'])


def downgrade():
    # Reverse the upgrade process
    op.add_column('user', sa.Column('old_id', sa.Integer, autoincrement=True))
    op.add_column('item', sa.Column('old_id', sa.Integer, autoincrement=True))
    op.add_column('item', sa.Column('old_current_owner_id', sa.Integer, nullable=True))
    op.add_column('room', sa.Column('old_id', sa.Integer, autoincrement=True))
    op.add_column('room', sa.Column('old_room_owner_id', sa.Integer, nullable=True))

    # Populate the old columns with default values
    # Generate sequences for the integer IDs if not exist
    op.execute('CREATE SEQUENCE IF NOT EXISTS user_id_seq AS INTEGER OWNED BY "user".old_id')
    op.execute('CREATE SEQUENCE IF NOT EXISTS item_id_seq AS INTEGER OWNED BY item.old_id')
    op.execute('CREATE SEQUENCE IF NOT EXISTS room_id_seq AS INTEGER OWNED BY room.old_id')

    op.execute('SELECT setval(\'user_id_seq\', COALESCE((SELECT MAX(old_id) + 1 FROM "user"), 1), false)')
    op.execute('SELECT setval(\'item_id_seq\', COALESCE((SELECT MAX(old_id) + 1 FROM item), 1), false)')
    op.execute('SELECT setval(\'room_id_seq\', COALESCE((SELECT MAX(old_id) + 1 FROM room), 1), false)')

    op.execute('UPDATE "user" SET old_id = nextval(\'user_id_seq\')')
    op.execute('UPDATE item SET old_id = nextval(\'item_id_seq\'), old_current_owner_id = (SELECT old_id FROM "user" WHERE "user".user_id = item.current_owner_id)')
    op.execute('UPDATE room SET old_id = nextval(\'room_id_seq\'), old_room_owner_id = (SELECT old_id FROM "user" WHERE "user".user_id = room.room_owner_id)')

    # Drop new columns and rename old columns back
    op.drop_constraint('item_current_owner_id_fkey', 'item', type_='foreignkey')
    op.drop_column('item', 'current_owner_id')
    op.alter_column('item', 'old_current_owner_id', new_column_name='current_owner_id')

    op.drop_column('user', 'user_id')
    op.alter_column('user', 'old_id', new_column_name='id')

    op.drop_column('item', 'item_id')
    op.alter_column('item', 'old_id', new_column_name='id')

    op.drop_constraint('room_room_owner_id_fkey', 'room', type_='foreignkey')
    op.drop_column('room', 'room_owner_id')
    op.alter_column('room', 'old_room_owner_id', new_column_name='room_owner_id')

    op.drop_column('room', 'room_id')
    op.alter_column('room', 'old_id', new_column_name='id')

    # Create primary key constraints
    op.create_primary_key('user_pkey', 'user', ['id'])
    op.create_primary_key('item_pkey', 'item', ['id'])
    op.create_primary_key('room_pkey', 'room', ['id'])

    # Recreate foreign key constraints
    op.create_foreign_key('item_current_owner_id_fkey', 'item', 'user', ['current_owner_id'], ['id'])
    op.create_foreign_key('room_room_owner_id_fkey', 'room', 'user', ['room_owner_id'], ['id'])