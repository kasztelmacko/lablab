import {
  Box,
  Container,
  Flex,
  Heading,
  Skeleton,
  Text,
  } from "@chakra-ui/react"
  import { useQuery, useQueryClient } from "@tanstack/react-query"
  import { createFileRoute, useNavigate } from "@tanstack/react-router"
  import { useEffect } from "react"
  import { z } from "zod"
  
  import { type RoomPublic, type UserPublic, RoomsService } from "../../client"
  import ActionsMenu from "../../components/Common/ActionsMenu"
  import Navbar from "../../components/Common/Navbar"
  import AddRoom from "../../components/Rooms/AddRoom"
  import AddItem from "../../components/Items/AddItem"
  import { PaginationFooter } from "../../components/Common/PaginationFooter.tsx"
  
  const roomsSearchSchema = z.object({
    page: z.number().catch(1),
  })
  
  type roomsSearchParams = z.infer<typeof roomsSearchSchema>
  
  export const Route = createFileRoute("/_layout/rooms")({
    component: Rooms,
    validateSearch: (search: roomsSearchParams) => roomsSearchSchema.parse(search),
  })
  
  const PER_PAGE = 30
  
  function getRoomsQueryOptions({ page }: { page: number }) {
    return {
      queryFn: () =>
        RoomsService.readRooms({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
      queryKey: ["rooms", { page }],
    }
  }
  
  function RoomsGrid() {
    const queryClient = useQueryClient()
    const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
    const { page } = Route.useSearch()
    const navigate = useNavigate({ from: Route.fullPath })
    const setPage = (page: number) =>
      navigate({ search: (prev: { [key: string]: string }) => ({ ...prev, page }) })
  
    // Define the expected shape of the query data
    type RoomsQueryData = {
      data: RoomPublic[]
      count: number;
    }
  
    const {
      data: rooms,
      isPending,
      isPlaceholderData,
    } = useQuery<RoomsQueryData>({
      ...getRoomsQueryOptions({ page }),
      placeholderData: (prevData: RoomsQueryData | undefined) => prevData,
    })

    const totalPages = rooms ? Math.ceil(rooms.count / PER_PAGE) : 0;
    const showPagination = totalPages > 1;
  
    const hasNextPage = !isPlaceholderData && rooms?.data.length === PER_PAGE
    const hasPreviousPage = page > 1
  
    useEffect(() => {
      if (hasNextPage) {
        queryClient.prefetchQuery(getRoomsQueryOptions({ page: page + 1 }))
      }
    }, [page, queryClient, hasNextPage])
  
    // Check if the current user has permission to edit rooms
    const canEditRooms = currentUser?.is_superuser || currentUser?.can_edit_labs
    const canEditItems = currentUser?.is_superuser || currentUser?.can_edit_items
  
    return (
      <>
        <Flex
          flexWrap="wrap"
          gap={6}
          justifyContent="left"
          alignItems="stretch"
          mt={6}
        >
          {/* Add Room Card */}
          {canEditRooms && (
          <Box
            w={{ base: "100%", md: "48%", lg: "31%", xl: "18%" }}
            p={4}
            borderRadius="lg"
            boxShadow="md"
            bg="white"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Navbar type={"Room"} addModalAs={AddRoom} />
          </Box>
          )}
    
          {isPending ? (
            // Skeleton Loading State
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
            // Room Cards
            rooms?.data.map((room: RoomPublic) => (
              <Box
                key={room.room_id}
                w={{ base: "100%", md: "48%", lg: "31%", xl: "18%" }}
                p={4}
                borderRadius="lg"
                boxShadow="md"
                bg="white"
                textAlign="center"
                opacity={isPlaceholderData ? 0.5 : 1}
                position="relative"
              >
                <Flex justifyContent="space-between" alignItems="flex-start">
                  {/* Card Content */}
                  <Flex flexDirection="column" alignItems="center" w="100%">
                    <Text fontSize="xl" fontWeight="bold" mb={2}>
                      {room.room_number}
                    </Text>
    
                    <Flex justifyContent="center" alignItems="center" mb={4}>
                      <Text color="gray.600">{room.room_place}</Text>
                    </Flex>

                    {canEditItems && (
                    <Navbar type={"Item"} addModalAs={AddItem} roomId ={room.room_id}/>
                    )}
    
                    {/* Actions Menu */}
                    {canEditRooms && (
                      <Box position="absolute" right={4} top={4}>
                        <ActionsMenu
                          type="Room"
                          value={room}
                        />
                      </Box>
                    )}
                  </Flex>
                </Flex>
              </Box>
            ))
          )}
        </Flex>
    
        {/* Pagination */}
        {showPagination && (
          <PaginationFooter
            onChangePage={setPage}
            page={page}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
          />
        )}
      </>
    );
  }
  
function Rooms() {
  return (
    <Container maxW="full">
      <br></br>
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Rooms
      </Heading>

      <RoomsGrid />
    </Container>
  );
}

