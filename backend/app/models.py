import uuid

from datetime import datetime

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class UserBase(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    is_part_of_lab: bool = False
    can_edit_items: bool = False
    can_edit_labs: bool = False
    can_edit_users: bool = False


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    user_id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str


# Properties to return via API, id is always required
class UserPublic(UserBase):
    user_id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int

class UserPermissionsUpdate(SQLModel):
    is_part_of_lab: bool | None = Field(default=None)
    can_edit_items: bool | None = Field(default=None)
    can_edit_labs: bool | None = Field(default=None)
    can_edit_users: bool | None = Field(default=None)



# Shared properties
class ItemBase(SQLModel):
    item_name: str = Field(min_length=1, max_length=255)
    current_room: str | None = Field(default=None, max_length=255)
    table_name: str | None = Field(default=None, max_length=255)
    system_name: str | None = Field(default=None, max_length=255)
    current_owner_id: uuid.UUID | None = Field(default=None, foreign_key="user.user_id")
    taken_at: datetime | None = Field(default=None)
    item_img_url: str | None = Field(default=None, max_length=255)
    item_vendor: str | None = Field(default=None, max_length=255)
    item_params: str | None = Field(default=None, max_length=255)
    is_available: bool = Field(default=True)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(SQLModel):
    item_name: str | None = Field(default=None, min_length=1, max_length=255)
    item_img_url: str | None = Field(default=None, max_length=255)
    item_vendor: str | None = Field(default=None, max_length=255)
    item_params: str | None = Field(default=None, max_length=255)


# Properties to receive when taking or returning an item
class ItemTake(SQLModel):
    table_name: str | None = Field(default=None, max_length=255)
    current_room: str | None = Field(default=None, max_length=255)
    system_name: str | None = Field(default=None, max_length=255)
    current_owner_id: uuid.UUID | None = Field(default=None, foreign_key="user.user_id")
    taken_at: datetime | None = Field(default=None)
    is_available: bool = Field(default=True)


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    item_id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    item_id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int

class RoomBase(SQLModel):
    room_number: str = Field(max_length=255)
    room_place: str = Field(max_length=255)
    room_owner_id: uuid.UUID | None = Field(default=None, foreign_key="user.user_id")


# Properties to receive via API on creation
class RoomCreate(RoomBase):
    pass


# Properties to receive via API on update
class RoomUpdate(SQLModel):
    room_number: str | None = Field(default=None, max_length=255)
    room_place: str | None = Field(default=None, max_length=255)
    room_owner_id: uuid.UUID | None = Field(default=None, foreign_key="user.user_id")


# Database model, database table inferred from class name
class Room(RoomBase, table=True):
    room_id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


# Properties to return via API, id is always required
class RoomPublic(RoomBase):
    room_id: uuid.UUID


class RoomsPublic(SQLModel):
    data: list[RoomPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)
