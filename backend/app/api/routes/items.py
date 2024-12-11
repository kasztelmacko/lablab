import uuid
from typing import Any
from datetime import datetime

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Item, ItemCreate, ItemPublic, ItemsPublic, ItemUpdate, ItemTake, Message

router = APIRouter(prefix="/items", tags=["items"])


@router.get("/", response_model=ItemsPublic)
def read_items(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve items.
    """

    if current_user.is_part_of_lab:
        count_statement = select(func.count()).select_from(Item)
        count = session.exec(count_statement).one()
        statement = select(Item).offset(skip).limit(limit)
        items = session.exec(statement).all()
    else:
        items = []
        count = 0

    return ItemsPublic(data=items, count=count)


@router.get("/{item_id}", response_model=ItemPublic)
def read_item(session: SessionDep, current_user: CurrentUser, item_id: uuid.UUID) -> Any:
    """
    Get item by ID.
    """
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if not current_user.is_part_of_lab:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return item


@router.post("/", response_model=ItemPublic)
def create_item(
    *, session: SessionDep, current_user: CurrentUser, item_in: ItemCreate
) -> Any:
    """
    Create new item.
    """
    if not (current_user.is_part_of_lab and current_user.can_edit_items):
        raise HTTPException(
            status_code=403,
            detail="You do not have sufficient permissions to create an item.",
        )

    item = Item.model_validate(item_in, update={"current_owner_id": None})
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.put("/{item_id}", response_model=ItemPublic)
def update_item(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    item_id: uuid.UUID,
    item_in: ItemUpdate,
) -> Any:
    """
    Update an item.
    """
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if not (current_user.is_part_of_lab and current_user.can_edit_items):
        raise HTTPException(
            status_code=403,
            detail="You do not have sufficient permissions to create an item.",
        )
    update_dict = item_in.model_dump(exclude_unset=True)
    item.sqlmodel_update(update_dict)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

@router.put("/{item_id}/take", response_model=ItemPublic)
def take_item(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    item_id: uuid.UUID,
    item_take: ItemTake,
) -> Any:
    """
    Take an item. Only users who are part of the lab can take an item.
    """
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Check if the user is part of the lab
    if not current_user.is_part_of_lab:
        raise HTTPException(
            status_code=403,
            detail="You do not have sufficient permissions to take this item.",
        )

    update_dict = item_take.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(item, field, value)

    if item_take.current_owner_id is None:
        item.current_owner_id = current_user.id

    if item_take.taken_at is None:
        item.taken_at = datetime.utcnow()

    if item_take.is_available is None:
        item.is_available = False

    session.add(item)
    session.commit()
    session.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_item(
    session: SessionDep, current_user: CurrentUser, item_id: uuid.UUID
) -> Message:
    """
    Delete an item.
    """
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if not (current_user.is_part_of_lab and current_user.can_edit_items):
        raise HTTPException(
            status_code=403,
            detail="You do not have sufficient permissions to create an item.",
        )
    session.delete(item)
    session.commit()
    return Message(message="Item deleted successfully")
