import {
  Button,
  Checkbox,
  FormControl,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import {
  type ApiError,
  type UserPublic,
  UsersService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface EditUserProps {
  user: UserPublic
  isOpen: boolean
  onClose: () => void
}

interface UserPermissionsForm {
  is_part_of_lab?: boolean | null
  can_edit_items?: boolean | null
  can_edit_labs?: boolean | null
  can_edit_users?: boolean | null
}

const EditUser = ({ user, isOpen, onClose }: EditUserProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<UserPermissionsForm>({
    mode: "onBlur",
    defaultValues: {
      is_part_of_lab: user.is_part_of_lab || false,
      can_edit_items: user.can_edit_items || false,
      can_edit_labs: user.can_edit_labs || false,
      can_edit_users: user.can_edit_users || false,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: UserPermissionsForm) =>
      UsersService.updateUser({
        user_id: user.user_id,
        requestBody: data,
      }),
    onSuccess: () => {
      showToast("Success!", "User permissions updated successfully.", "success")
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const onSubmit = handleSubmit((data: UserPermissionsForm) => {
    mutation.mutate(data)
  })

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
        <ModalContent as="form" onSubmit={onSubmit}>
          <ModalHeader>Edit User Permissions</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Checkbox {...register("is_part_of_lab")} colorScheme="teal">
                Is part of lab?
              </Checkbox>
            </FormControl>
            <FormControl>
              <Checkbox {...register("can_edit_items")} colorScheme="teal">
                Can edit items?
              </Checkbox>
            </FormControl>
            <FormControl>
              <Checkbox {...register("can_edit_labs")} colorScheme="teal">
                Can edit labs?
              </Checkbox>
            </FormControl>
            <FormControl>
              <Checkbox {...register("can_edit_users")} colorScheme="teal">
                Can edit users?
              </Checkbox>
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

export default EditUser