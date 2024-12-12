import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FiEdit, FiTrash } from "react-icons/fi"

import type { ItemPublic, UserPublic, RoomPublic } from "../../client"
import EditUser from "../Admin/EditUser"
import EditItem from "../Items/EditItem"
import EditRoom from "../Rooms/EditRoom"
import Delete from "./DeleteAlert"

interface ActionsMenuProps {
  type: string
  value: ItemPublic | UserPublic | RoomPublic
  disabled?: boolean
}

const ActionsMenu = ({ type, value, disabled }: ActionsMenuProps) => {
  const editModal = useDisclosure()
  const deleteModal = useDisclosure()

  // Type guards to determine the type of value
  const isItemPublic = (value: any): value is ItemPublic => {
    return "item_id" in value
  }

  const isUserPublic = (value: any): value is UserPublic => {
    return "user_id" in value
  }

  const isRoomPublic = (value: any): value is RoomPublic => {
    return "room_id" in value
  }

  // Get the correct ID based on the type
  const getId = (value: ItemPublic | UserPublic | RoomPublic): string => {
    if (isItemPublic(value)) {
      return value.item_id
    } else if (isUserPublic(value)) {
      return value.user_id
    } else if (isRoomPublic(value)) {
      return value.room_id
    } else {
      throw new Error("Unexpected type")
    }
  }

  return (
    <>
      <Menu>
        <MenuButton
          isDisabled={disabled}
          as={Button}
          rightIcon={<BsThreeDotsVertical />}
          variant="unstyled"
        />
        <MenuList>
          <MenuItem
            onClick={editModal.onOpen}
            icon={<FiEdit fontSize="16px" />}
          >
            Edit {type}
          </MenuItem>
          <MenuItem
            onClick={deleteModal.onOpen}
            icon={<FiTrash fontSize="16px" />}
            color="ui.danger"
          >
            Delete {type}
          </MenuItem>
        </MenuList>
        {isUserPublic(value) ? (
          <EditUser
            user={value}
            isOpen={editModal.isOpen}
            onClose={editModal.onClose}
          />
        ) : isItemPublic(value) ? (
          <EditItem
            item={value}
            isOpen={editModal.isOpen}
            onClose={editModal.onClose}
          />
        ) : isRoomPublic(value) ? (
          <EditRoom
            room={value}
            isOpen={editModal.isOpen}
            onClose={editModal.onClose}
          />
        ) : null}
        <Delete
          type={type}
          id={getId(value)}
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.onClose}
        />
      </Menu>
    </>
  )
}

export default ActionsMenu