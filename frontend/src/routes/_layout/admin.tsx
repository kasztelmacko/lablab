import {
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FiMail } from "react-icons/fi";
import { useEffect, useState } from "react";
import { z } from "zod";

import { type UserPublic, UsersService } from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import FilterComponent from "../../components/Common/Filter.tsx";
import { PaginationFooter } from "../../components/Common/PaginationFooter.tsx";

const usersSearchSchema = z.object({
  page: z.number().catch(1),
});

type UsersSearchParams = z.infer<typeof usersSearchSchema>;

export const Route = createFileRoute("/_layout/admin")({
  component: Admin,
  validateSearch: (search: UsersSearchParams) => usersSearchSchema.parse(search),
});

const PER_PAGE = 30;

function getUsersQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      UsersService.readUsers({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["users", { page }],
  };
}

function UsersGrid({ filters }: { filters: { [key: string]: boolean | null } }) {
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const { page } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const setPage = (page: number) =>
    navigate({ search: (prev: { [key: string]: string }) => ({ ...prev, page }) });

  type UsersQueryData = {
    data: UserPublic[];
    count: number;
  };

  const {
    data: users,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getUsersQueryOptions({ page }),
    placeholderData: (prevData: UsersQueryData | undefined) => prevData,
  });

  const hasNextPage = !isPlaceholderData && users?.data.length === PER_PAGE;
  const hasPreviousPage = page > 1;

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getUsersQueryOptions({ page: page + 1 }));
    }
  }, [page, queryClient, hasNextPage]);

  const canEditUsers = currentUser?.is_superuser || currentUser?.can_edit_users;

  // Apply filters to users
  const filteredUsers = users?.data.filter((user: UserPublic) => {
    if (filters.is_part_of_lab === null) {
      return true; // Show all users if "All" is selected
    }
    return user.is_part_of_lab === filters.is_part_of_lab;
  });

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
          filteredUsers?.map((user: UserPublic) => (
            <Box
              key={user.user_id}
              w={{ base: "100%", md: "48%", lg: "31%", xl: "18%" }}
              p={4}
              borderRadius="lg"
              boxShadow="md"
              bg="white"
              textAlign="center"
              borderBottomWidth={user.is_part_of_lab ? "4px" : "0"}
              borderBottomColor={user.is_part_of_lab ? "ui.success" : "transparent"}
            >
              <Flex justifyContent="space-between" alignItems="flex-start">
                {/* Card Content */}
                <Flex flexDirection="column" alignItems="center" w="100%">
                  <Text fontSize="xl" fontWeight="bold" mb={2}>
                    {user.full_name || "N/A"}
                    {currentUser?.user_id === user.user_id && (
                      <Badge ml="1" colorScheme="teal">
                        You
                      </Badge>
                    )}
                  </Text>

                  <Flex justifyContent="center" alignItems="center" mb={4}>
                    <FiMail size={24} color="gray" style={{ marginRight: "8px" }} />
                    <Text color="gray.600">{user.email}</Text>
                  </Flex>
                </Flex>

                {/* Actions Menu */}
                {canEditUsers ? (
                  <ActionsMenu
                    type="User"
                    value={user}
                    disabled={currentUser?.user_id === user.user_id}
                  />
                ) : (
                  <Badge colorScheme="gray">No Actions</Badge>
                )}
              </Flex>
            </Box>
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

function Admin() {
  const [filters, setFilters] = useState<{ [key: string]: boolean | null }>({
    is_part_of_lab: null,
  });

  const handleFilterChange = (filterKey: string, filterValue: boolean | null) => {
    if (filterKey === "all") {
      setFilters({ is_part_of_lab: null });
    } else {
      setFilters((prevFilters: { [key: string]: boolean | null }) => ({
        ...prevFilters,
        [filterKey]: filterValue,
      }));
    }
  };

  return (
    <Container maxW="full">
      <Flex justifyContent="space-between" alignItems="center" pt={12} mb={4}>
        <Heading size="lg" textAlign={{ base: "center", md: "left" }}>
          Users Management
        </Heading>
        <FilterComponent type="User" onFilterChange={handleFilterChange} />
      </Flex>
      <UsersGrid filters={filters} />
    </Container>
  );
}