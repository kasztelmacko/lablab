import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Skeleton,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

import {
  type ItemPublic,
  type UserPublic,
  type RoomPublic,
  ItemsService,
  UsersService,
  RoomsService,
} from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import Navbar from "../../components/Common/Navbar";
import AddItem from "../../components/Items/AddItem";
import TakeItem from "../../components/Items/TakeItem";
import { PaginationFooter } from "../../components/Common/PaginationFooter.tsx";

const itemsSearchSchema = z.object({
  page: z.number().catch(1),
});

type itemsSearchParams = z.infer<typeof itemsSearchSchema>;

export const Route = createFileRoute("/_layout/items")({
  component: Items,
  validateSearch: (search: itemsSearchParams) => itemsSearchSchema.parse(search),
});

const PER_PAGE = 30;

function getItemsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      ItemsService.readItems({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["items", { page }],
  };
}

function ItemsGrid() {
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const { page } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const setPage = (page: number) =>
    navigate({ search: (prev: { [key: string]: string }) => ({ ...prev, page }) });

  type ItemsQueryData = {
    data: ItemPublic[];
  };

  const {
    data: items,
    isPending,
    isPlaceholderData,
  } = useQuery<ItemsQueryData>({
    ...getItemsQueryOptions({ page }),
    placeholderData: (prevData: ItemsQueryData | undefined) => prevData,
  });

  const hasNextPage = !isPlaceholderData && items?.data.length === PER_PAGE;
  const hasPreviousPage = page > 1;

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getItemsQueryOptions({ page: page + 1 }));
    }
  }, [page, queryClient, hasNextPage]);

  const canEditItems = currentUser?.is_superuser || currentUser?.can_edit_items || false;

  return (
    <>
      <Flex
        flexWrap="wrap"
        gap={6}
        justifyContent="center"
        alignItems="stretch"
        mt={6}
      >
        {isPending ? (
          new Array(5).fill(null).map((_, index) => (
            <Box
              key={index}
              w={{ base: "100%", md: "48%", lg: "31%", xl: "18%" }}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              boxShadow="md"
              bg="white"
            >
              <Skeleton height="20px" mb={2} />
              <Skeleton height="16px" mb={2} />
              <Skeleton height="16px" mb={2} />
              <Skeleton height="16px" mb={2} />
              <Skeleton height="32px" />
            </Box>
          ))
        ) : (
          items?.data.map((item: ItemPublic) => (
            <ItemCard key={item.item_id} item={item} canEditItems={canEditItems} />
          ))
        )}
      </Flex>
      <PaginationFooter
        onChangePage={setPage}
        page={page}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
    </>
  );
}

function ItemCard({ item, canEditItems }: { item: ItemPublic; canEditItems: boolean }) {
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isTakeItemOpen, onOpen: onTakeItemOpen, onClose: onTakeItemClose } = useDisclosure();
  const { isOpen: isReleaseItemOpen, onOpen: onReleaseItemOpen, onClose: onReleaseItemClose } = useDisclosure();

  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);

  // Fetch room details
  const { data: room } = useQuery<RoomPublic>({
    queryKey: ["room", item.current_room],
    queryFn: () => RoomsService.readRoom({ room_id: item.current_room! }),
    enabled: !!item.current_room,
  });

  // Fetch user details
  const { data: user } = useQuery<UserPublic>({
    queryKey: ["user", item.current_owner_id],
    queryFn: () => UsersService.readUserById({ user_id: item.current_owner_id! }),
    enabled: !!item.current_owner_id,
  });

  const handleReleaseItem = async () => {
    try {
      await ItemsService.releaseItem({ item_id: item.item_id });
  
      queryClient.invalidateQueries({ queryKey: ["items"] });
  
      onReleaseItemClose();
    } catch (error) {
      console.error("Error releasing item:", error);
    }
  };

  const isCurrentUserOwner = currentUser?.user_id === item.current_owner_id;

  return (
    <Box
      w={{ base: "100%", md: "48%", lg: "31%", xl: "18%" }}
      p={4}
      borderRadius="lg"
      boxShadow="md"
      bg="white"
      textAlign="center"
      borderBottomWidth="4px"
      borderBottomColor={item.is_available ? "ui.success" : "ui.danger"}
    >
      <Flex justifyContent="space-between" alignItems="flex-start">
        {/* Card Content */}
        <Flex flexDirection="column" alignItems="center" w="100%">
          <Text fontSize="xl" fontWeight="bold" mb={2}>
            {item.item_name || "N/A"}
          </Text>

          {item.item_img_url && (
            <Box mb={2}>
              <img
                src={item.item_img_url}
                alt={item.item_name}
                style={{ width: "100%", height: "auto", borderRadius: "8px" }}
              />
            </Box>
          )}

          <Flex justifyContent="center" alignItems="center" mb={2}>
            <Text color="gray.600">
              <strong>Vendor:</strong> {item.item_vendor || ""}
            </Text>
          </Flex>

          <Flex justifyContent="center" alignItems="center" mb={2}>
            <Text color="gray.600">
              <strong>Parameters:</strong> {item.item_params || ""}
            </Text>
          </Flex>

          {/* Button to open the modal */}
          <Button onClick={onDetailsOpen} mt={4}>
            View Details
          </Button>
        </Flex>

        {/* Actions Menu */}
        {canEditItems ? (
          <ActionsMenu type="Item" value={item} />
        ) : (
          <Badge colorScheme="gray">No Actions</Badge>
        )}
      </Flex>

      {/* Modal for item details */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" gap={4}>
              {/* Item Name as Heading */}
              <Heading size="lg" textAlign="center" mb={4}>
                {item.item_name || "N/A"}
              </Heading>
              {/* Separate Box for Each Item Place */}
              <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
                <Text>
                  <strong>Current Owner:</strong> {user?.full_name || "N/A"}
                </Text>
              </Box>
              <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
                <Text>
                  <strong>Taken At:</strong>{" "}
                  {item.taken_at
                    ? new Date(item.taken_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "N/A"}
                </Text>
              </Box>
              <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
                <Text>
                  <strong>Current Room:</strong> {room?.room_number || "N/A"}
                </Text>
              </Box>

              <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
                <Text>
                  <strong>Table Name:</strong> {item.table_name || "N/A"}
                </Text>
              </Box>

              <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
                <Text>
                  <strong>System Name:</strong> {item.system_name || "N/A"}
                </Text>
              </Box>

              {/* Section: Item Details in Accordion */}
              <Accordion allowToggle>
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Heading size="md">Item Details</Heading>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Text>
                      <strong>Vendor:</strong> {item.item_vendor || "N/A"}
                    </Text>
                    <Text>
                      <strong>Parameters:</strong> {item.item_params || "N/A"}
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Flex>
          </ModalBody>
          <ModalFooter>
            {isCurrentUserOwner && (
              <Button onClick={onReleaseItemOpen} mr={3}>
                Release Item
              </Button>
            )}
            <Button onClick={onTakeItemOpen}>Take Item</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* TakeItem Modal */}
      <TakeItem item={item} isOpen={isTakeItemOpen} onClose={onTakeItemClose} />

      {/* ReleaseItem Modal */}
      <Modal isOpen={isReleaseItemOpen} onClose={onReleaseItemClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to release this item?</Text>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={handleReleaseItem}>
              Confirm
            </Button>
            <Button onClick={onReleaseItemClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function Items() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Items Management
      </Heading>

      <Navbar type={"Item"} addModalAs={AddItem} />
      <ItemsGrid />
    </Container>
  );
}