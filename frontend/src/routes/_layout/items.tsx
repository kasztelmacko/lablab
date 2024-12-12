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

import { type ItemPublic, type UserPublic, ItemsService } from "../../client"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"
import AddItem from "../../components/Items/AddItem"
import { PaginationFooter } from "../../components/Common/PaginationFooter.tsx"

const itemsSearchSchema = z.object({
  page: z.number().catch(1),
})

type itemsSearchParams = z.infer<typeof itemsSearchSchema>

export const Route = createFileRoute("/_layout/items")({
  component: Items,
  validateSearch: (search: itemsSearchParams) => itemsSearchSchema.parse(search),
})

const PER_PAGE = 30

function getItemsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      ItemsService.readItems({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["items", { page }],
  }
}

function ItemsTable() {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const { page } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev: {[key: string]: string}) => ({ ...prev, page }) })

  // Define the expected shape of the query data
  type ItemsQueryData = {
    data: ItemPublic[]
  }

  const {
    data: items,
    isPending,
    isPlaceholderData,
  } = useQuery<ItemsQueryData>({
    ...getItemsQueryOptions({ page }),
    placeholderData: (prevData: ItemsQueryData | undefined) => prevData, // Explicitly type prevData
  })

  const hasNextPage = !isPlaceholderData && items?.data.length === PER_PAGE
  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getItemsQueryOptions({ page: page + 1 }))
    }
  }, [page, queryClient, hasNextPage])

  // Check if the current user has permission to edit items
  const canEditItems = currentUser?.is_superuser || currentUser?.can_edit_items

  return (
    <>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th>Item Name</Th>
              <Th>Current Room</Th>
              <Th>Table Name</Th>
              <Th>System Name</Th>
              <Th>Current Owner ID</Th>
              <Th>Taken At</Th>
              <Th>Item Image URL</Th>
              <Th>Item Vendor</Th>
              <Th>Item Parameters</Th>
              <Th>Is Available</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              <Tr>
                {new Array(11).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} paddingBlock="16px" />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {items?.data.map((item: ItemPublic) => (
                <Tr key={item.item_id} opacity={isPlaceholderData ? 0.5 : 1}>
                  <Td>{item.item_name}</Td>
                  <Td>{item.current_room || "N/A"}</Td>
                  <Td>{item.table_name || "N/A"}</Td>
                  <Td>{item.system_name || "N/A"}</Td>
                  <Td>{item.current_owner_id || "N/A"}</Td>
                  <Td>{item.taken_at || "N/A"}</Td>
                  <Td>{item.item_img_url || "N/A"}</Td>
                  <Td>{item.item_vendor || "N/A"}</Td>
                  <Td>{item.item_params || "N/A"}</Td>
                  <Td>{item.is_available ? "Yes" : "No"}</Td>
                  <Td>
                    {canEditItems ? (
                      <ActionsMenu type={"Item"} value={item} />
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

function Items() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Items Management
      </Heading>

      <Navbar type={"Item"} addModalAs={AddItem} />
      <ItemsTable />
    </Container>
  )
}