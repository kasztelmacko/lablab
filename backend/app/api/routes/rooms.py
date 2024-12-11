import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Room, RoomCreate, RoomPublic, RoomsPublic, RoomUpdate, Message

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.post("/", response_model=RoomPublic)
def create_room(
    *, session: SessionDep, current_user: CurrentUser, room_in: RoomCreate
) -> Any:
    """
    Create a new room.
    """
    # Check if the user is part of the lab and has the `can_edit_labs` permission
    if not (current_user.is_part_of_lab and current_user.can_edit_labs):
        raise HTTPException(
            status_code=403,
            detail="You do not have sufficient permissions to create a room.",
        )

    # Create the room and set the room_owner_id to the current user's ID if not provided
    room_data = room_in.model_dump()
    if room_data.get("room_owner_id") is None:
        room_data["room_owner_id"] = current_user.id

    room = Room(**room_data)
    session.add(room)
    session.commit()
    session.refresh(room)
    return room


@router.get("/", response_model=RoomsPublic)
def read_rooms(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve all rooms.
    """
    # Check if the user is part of the lab
    if not current_user.is_part_of_lab:
        raise HTTPException(
            status_code=403,
            detail="You do not have sufficient permissions to view rooms.",
        )

    count_statement = select(func.count()).select_from(Room)
    count = session.exec(count_statement).one()

    statement = select(Room).offset(skip).limit(limit)
    rooms = session.exec(statement).all()

    return RoomsPublic(data=rooms, count=count)


@router.get("/{room_id}", response_model=RoomPublic)
def read_room(
    session: SessionDep, current_user: CurrentUser, room_id: uuid.UUID
) -> Any:
    """
    Get a room by ID.
    """
    # Check if the user is part of the lab
    if not current_user.is_part_of_lab:
        raise HTTPException(
            status_code=403,
            detail="You do not have sufficient permissions to view this room.",
        )

    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    return room


@router.put("/{room_id}", response_model=RoomPublic)
def update_room(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    room_id: uuid.UUID,
    room_in: RoomUpdate,
) -> Any:
    """
    Update a room.
    """
    # Check if the user is part of the lab and has the `can_edit_labs` permission
    if not (current_user.is_part_of_lab and current_user.can_edit_labs):
        raise HTTPException(
            status_code=403,
            detail="You do not have sufficient permissions to update a room.",
        )

    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    update_dict = room_in.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(room, field, value)

    session.add(room)
    session.commit()
    session.refresh(room)
    return room


@router.delete("/{room_id}", response_model=Message)
def delete_room(
    session: SessionDep, current_user: CurrentUser, room_id: uuid.UUID
) -> Any:
    """
    Delete a room.
    """
    # Check if the user is part of the lab and has the `can_edit_labs` permission
    if not (current_user.is_part_of_lab and current_user.can_edit_labs):
        raise HTTPException(
            status_code=403,
            detail="You do not have sufficient permissions to delete a room.",
        )

    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    session.delete(room)
    session.commit()
    return Message(message="Room deleted successfully")