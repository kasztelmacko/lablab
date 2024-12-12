import {
    Container,
    Heading,
    SkeletonText,
    Table,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
  } from "@chakra-ui/react"
  import { useQuery, useQueryClient } from "@tanstack/react-query"
  import { createFileRoute, useNavigate } from "@tanstack/react-router"
  import { useEffect } from "react"
  import { z } from "zod"
  
  import { type RoomPublic, type UserPublic, RoomsService } from "../../client"
  import ActionsMenu from "../../components/Common/ActionsMenu"
  import Navbar from "../../components/Common/Navbar"
  import AddRoom from "../../components/Rooms/AddRoom"
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
  
  function RoomsTable() {
    const queryClient = useQueryClient()
    const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
    const { page } = Route.useSearch()
    const navigate = useNavigate({ from: Route.fullPath })
    const setPage = (page: number) =>
      navigate({ search: (prev: { [key: string]: string }) => ({ ...prev, page }) })
  
    // Define the expected shape of the query data
    type RoomsQueryData = {
      data: RoomPublic[]
    }
  
    const {
      data: rooms,
      isPending,
      isPlaceholderData,
    } = useQuery<RoomsQueryData>({
      ...getRoomsQueryOptions({ page }),
      placeholderData: (prevData: RoomsQueryData | undefined) => prevData, // Explicitly type prevData
    })
  
    const hasNextPage = !isPlaceholderData && rooms?.data.length === PER_PAGE
    const hasPreviousPage = page > 1
  
    useEffect(() => {
      if (hasNextPage) {
        queryClient.prefetchQuery(getRoomsQueryOptions({ page: page + 1 }))
      }
    }, [page, queryClient, hasNextPage])
  
    // Check if the current user has permission to edit rooms
    const canEditRooms = currentUser?.is_superuser || currentUser?.can_edit_labs
  
    return (
      <>
        <TableContainer>
          <Table size={{ base: "sm", md: "md" }}>
            <Thead>
              <Tr>
                <Th>Room Number</Th>
                <Th>Room Place</Th>
                <Th>Room Owner ID</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            {isPending ? (
              <Tbody>
                <Tr>
                  {new Array(4).fill(null).map((_, index) => (
                    <Td key={index}>
                      <SkeletonText noOfLines={1} paddingBlock="16px" />
                    </Td>
                  ))}
                </Tr>
              </Tbody>
            ) : (
              <Tbody>
                {rooms?.data.map((room: RoomPublic) => (
                  <Tr key={room.room_id} opacity={isPlaceholderData ? 0.5 : 1}>
                    <Td>{room.room_number}</Td>
                    <Td>{room.room_place}</Td>
                    <Td>{room.room_owner_id}</Td>
                    <Td>
                      {canEditRooms ? (
                        <ActionsMenu type={"Room"} value={room} />
                      ) : (
                        []
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            )}
          </Table>
        </TableContainer>
        <PaginationFooter
          page={page}
          onChangePage={setPage}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
        />
      </>
    )
  }
  
  function Rooms() {
    return (
      <Container maxW="full">
        <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
          Rooms Management
        </Heading>
  
        <Navbar type={"Room"} addModalAs={AddRoom} />
        <RoomsTable />
      </Container>
    )
  }
  