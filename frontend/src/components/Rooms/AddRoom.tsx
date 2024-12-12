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
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import { type ApiError, type RoomCreate, RoomsService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface AddRoomProps {
  isOpen: boolean
  onClose: () => void
}

const AddRoom = ({ isOpen, onClose }: AddRoomProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()

  // Get the current user's data from the queryClient
  const currentUser = queryClient.getQueryData<{ user_id: string }>(["currentUser"])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoomCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      room_number: "",
      room_place: "",
      room_owner_id: currentUser?.user_id || "", // Pre-fill with current user's ID
    },
  })

  const mutation = useMutation({
    mutationFn: (data: RoomCreate) =>
      RoomsService.createRoom({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Room created successfully.", "success")
      reset()
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
    },
  })

  const onSubmit: SubmitHandler<RoomCreate> = (data) => {
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
        <ModalHeader>Add Room</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired isInvalid={!!errors.room_number}>
            <FormLabel htmlFor="room_number">Room Number</FormLabel>
            <Input
              id="room_number"
              {...register("room_number", {
                required: "Room number is required.",
              })}
              placeholder="Room Number"
              type="text"
            />
            {errors.room_number && (
              <FormErrorMessage>{errors.room_number.message}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl mt={4} isRequired isInvalid={!!errors.room_place}>
            <FormLabel htmlFor="room_place">Room Place</FormLabel>
            <Input
              id="room_place"
              {...register("room_place", {
                required: "Room place is required.",
              })}
              placeholder="Room Place"
              type="text"
            />
            {errors.room_place && (
              <FormErrorMessage>{errors.room_place.message}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl mt={4} isInvalid={!!errors.room_owner_id}>
            <FormLabel htmlFor="room_owner_id">Room Owner ID</FormLabel>
            <Input
              id="room_owner_id"
              {...register("room_owner_id", {
                required: "Room owner ID is required.",
              })}
              placeholder="Room Owner ID"
              type="text"
              value={currentUser?.user_id || ""} // Pre-fill with current user's ID
              isReadOnly // Make the field read-only
            />
            {errors.room_owner_id && (
              <FormErrorMessage>{errors.room_owner_id.message}</FormErrorMessage>
            )}
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

export default AddRoom