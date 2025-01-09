import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import {
  type ApiError,
  type ItemCreate,
  type RoomPublic,
  ItemsService,
  RoomsService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface AddItemProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

const AddItem = ({ isOpen, onClose, roomId }: AddItemProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()

  // Fetch the room
  const { data: room } = useQuery<RoomPublic>({
    queryKey: ["room", roomId],
    queryFn: () => RoomsService.readRoom({ room_id: roomId }),
    enabled: !!roomId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      item_name: "",
      current_room: roomId,
      item_img_url: "",
      item_vendor: "",
      item_params: "",
      is_available: true,
      table_name: null,
      system_name: null,
      current_owner_id: null,
      taken_at: null,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ItemCreate) =>
      ItemsService.createItem({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Item created successfully.", "success")
      reset()
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
  })

  const onSubmit: SubmitHandler<ItemCreate> = (data) => {
    mutation.mutate(data)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "sm", md: "md" }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Add Item</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired isInvalid={!!errors.item_name}>
            <FormLabel htmlFor="item_name">Item Name</FormLabel>
            <Input
              id="item_name"
              {...register("item_name", {
                required: "Item name is required.",
              })}
              placeholder="Item Name"
              type="text"
            />
            {errors.item_name && (
              <FormErrorMessage>{errors.item_name.message}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl mt={4} isRequired isInvalid={!!errors.current_room}>
            <FormLabel htmlFor="current_room">Current Room</FormLabel>
            <Select
              id="current_room"
              {...register("current_room", {
                required: "Current room is required.",
              })}
              isDisabled
            >
              {room && (
                <option value={room.room_id}>
                  {room.room_number} - {room.room_place}
                </option>
              )}
            </Select>
            {errors.current_room && (
              <FormErrorMessage>{errors.current_room.message}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl mt={4}>
            <FormLabel htmlFor="item_img_url">Item Image URL</FormLabel>
            <Input
              id="item_img_url"
              {...register("item_img_url")}
              placeholder="Item Image URL"
              type="text"
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel htmlFor="item_vendor">Item Vendor</FormLabel>
            <Input
              id="item_vendor"
              {...register("item_vendor")}
              placeholder="Item Vendor"
              type="text"
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel htmlFor="item_params">Item Parameters</FormLabel>
            <Input
              id="item_params"
              {...register("item_params")}
              placeholder="Item Parameters"
              type="text"
            />
          </FormControl>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AddItem