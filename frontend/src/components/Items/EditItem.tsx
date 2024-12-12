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
  type ItemPublic,
  type ItemUpdate,
  ItemsService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface EditItemProps {
  item: ItemPublic
  isOpen: boolean
  onClose: () => void
}

const EditItem = ({ item, isOpen, onClose }: EditItemProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<ItemUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      item_name: item.item_name,
      item_img_url: item.item_img_url,
      item_vendor: item.item_vendor,
      item_params: item.item_params,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ItemUpdate) =>
      ItemsService.updateItem({ item_id: item.item_id, requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Item updated successfully.", "success")
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
  })

  const onSubmit: SubmitHandler<ItemUpdate> = async (data: ItemUpdate) => {
    mutation.mutate(data)
  }

  const onCancel = () => {
    reset()
    onClose()
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Edit Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isInvalid={!!errors.item_name}>
              <FormLabel htmlFor="item_name">Item Name</FormLabel>
              <Input
                id="item_name"
                {...register("item_name", {
                  required: "Item name is required",
                })}
                type="text"
              />
              {errors.item_name && (
                <FormErrorMessage>{errors.item_name.message}</FormErrorMessage>
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
    </>
  )
}

export default EditItem