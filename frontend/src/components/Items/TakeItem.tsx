import {
    Button,
    FormControl,
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
    FormErrorMessage,
  } from "@chakra-ui/react";
  import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
  import { type SubmitHandler, useForm } from "react-hook-form";
  import { useEffect } from "react";
  
  import {
    type ApiError,
    type ItemPublic,
    type ItemTake,
    ItemsService,
    UserPublic,
    RoomsService,
    type RoomPublic,
  } from "../../client";
  import useCustomToast from "../../hooks/useCustomToast";
  import { handleError } from "../../utils";
  
  interface TakeItemProps {
    item: ItemPublic;
    isOpen: boolean;
    onClose: () => void;
  }
  
  const TakeItem = ({ item, isOpen, onClose }: TakeItemProps) => {
    const queryClient = useQueryClient();
    const showToast = useCustomToast();
    const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  
    // Fetch the list of rooms
    const { data: rooms, isLoading: isRoomsLoading } = useQuery<RoomPublic[]>({
      queryKey: ["rooms"],
      queryFn: () => RoomsService.readRooms({}).then((response) => response.data),
    });
  
    const {
      register,
      handleSubmit,
      reset,
      setValue,
      formState: { isSubmitting, isDirty, errors },
    } = useForm<ItemTake>({
      mode: "onBlur",
      criteriaMode: "all",
      defaultValues: {
        table_name: item.table_name,
        system_name: item.system_name,
        current_room: item.current_room,
      },
    });
  
    // Automatically set `current_owner_id` to the current user's ID
    useEffect(() => {
      if (currentUser) {
        setValue("current_owner_id", currentUser.user_id);
      }
    }, [currentUser, setValue]);
  
    // Automatically set `taken_at` to the current datetime
    useEffect(() => {
      setValue("taken_at", new Date().toISOString());
    }, [setValue]);
  
    // Automatically set `is_available` to `false` when the item is taken
    useEffect(() => {
      setValue("is_available", false);
    }, [setValue]);
  
    const mutation = useMutation({
      mutationFn: (data: ItemTake) =>
        ItemsService.takeItem({ item_id: item.item_id, requestBody: data }),
      onSuccess: () => {
        showToast("Success!", "Item taken successfully.", "success");
        onClose();
      },
      onError: (err: ApiError) => {
        handleError(err, showToast);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["items"] });
      },
    });
  
    const onSubmit: SubmitHandler<ItemTake> = async (data: ItemTake) => {
      mutation.mutate(data);
    };
  
    const onCancel = () => {
      reset();
      onClose();
    };
  
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Take Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {/* Table Name */}
            <FormControl mt={4}>
              <FormLabel htmlFor="table_name">Table Name</FormLabel>
              <Input
                id="table_name"
                {...register("table_name")}
                placeholder="Table Name"
                type="text"
              />
            </FormControl>
  
            {/* System Name */}
            <FormControl mt={4}>
              <FormLabel htmlFor="system_name">System Name</FormLabel>
              <Input
                id="system_name"
                {...register("system_name")}
                placeholder="System Name"
                type="text"
              />
            </FormControl>
  
            {/* Current Room */}
            <FormControl mt={4} isRequired isInvalid={!!errors.current_room}>
              <FormLabel htmlFor="current_room">In which room will the Item be?</FormLabel>
              <Select
                id="current_room"
                {...register("current_room", {
                  required: "Current room is required.",
                })}
                placeholder="Select a room"
                isDisabled={isRoomsLoading}
              >
                {rooms?.map((room: RoomPublic) => (
                  <option key={room.room_id} value={room.room_id}>
                    {room.room_number} - {room.room_place}
                  </option>
                ))}
              </Select>
              {errors.current_room && (
                <FormErrorMessage>{errors.current_room.message}</FormErrorMessage>
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
              Take
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  
  export default TakeItem;