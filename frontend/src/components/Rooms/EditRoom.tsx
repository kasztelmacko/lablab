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
  
  import {
    type ApiError,
    type RoomPublic,
    type RoomUpdate,
    RoomsService,
  } from "../../client"
  import useCustomToast from "../../hooks/useCustomToast"
  import { handleError } from "../../utils"
  
  interface EditRoomProps {
    room: RoomPublic
    isOpen: boolean
    onClose: () => void
  }
  
  const EditRoom = ({ room, isOpen, onClose }: EditRoomProps) => {
    const queryClient = useQueryClient()
    const showToast = useCustomToast()
    const {
      register,
      handleSubmit,
      reset,
      formState: { isSubmitting, errors, isDirty },
    } = useForm<RoomUpdate>({
      mode: "onBlur",
      criteriaMode: "all",
      defaultValues: {
        room_number: room.room_number,
        room_place: room.room_place,
        room_owner_id: room.room_owner_id,
      },
    })
  
    const mutation = useMutation({
      mutationFn: (data: RoomUpdate) =>
        RoomsService.updateRoom({ room_id: room.room_id, requestBody: data }),
      onSuccess: () => {
        showToast("Success!", "Room updated successfully.", "success")
        onClose()
      },
      onError: (err: ApiError) => {
        handleError(err, showToast)
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["rooms"] })
      },
    })
  
    const onSubmit: SubmitHandler<RoomUpdate> = async (data: RoomUpdate) => {
      mutation.mutate(data)
    }
  
    const onCancel = () => {
      reset()
      onClose()
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
          <ModalHeader>Edit Room</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isInvalid={!!errors.room_number}>
              <FormLabel htmlFor="room_number">Room Number</FormLabel>
              <Input
                id="room_number"
                {...register("room_number", {
                  required: "Room number is required",
                })}
                type="text"
              />
              {errors.room_number && (
                <FormErrorMessage>{errors.room_number.message}</FormErrorMessage>
              )}
            </FormControl>
  
            <FormControl mt={4} isInvalid={!!errors.room_place}>
              <FormLabel htmlFor="room_place">Room Place</FormLabel>
              <Input
                id="room_place"
                {...register("room_place", {
                  required: "Room place is required",
                })}
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
                  required: "Room owner ID is required",
                })}
                type="text"
              />
              {errors.room_owner_id && (
                <FormErrorMessage>{errors.room_owner_id.message}</FormErrorMessage>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              isDisabled={!isDirty}
            >
              Save
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }
  
  export default EditRoom