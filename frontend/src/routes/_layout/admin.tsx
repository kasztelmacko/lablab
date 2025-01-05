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
import BoolFilterComponent from "../../components/Common/Filters/FilterBOOL.tsx";
import SearchBar from "../../components/Common/SearchBar.tsx";
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

function UsersGrid({
  filters,
  searchTerm,
}: {
  filters: { is_part_of_lab: boolean | null };
  searchTerm: string;
}) {
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

  const totalPages = users ? Math.ceil(users.count / PER_PAGE) : 0;
  const showPagination = totalPages > 1;

  const hasNextPage = !isPlaceholderData && users?.data.length === PER_PAGE;
  const hasPreviousPage = page > 1;

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getUsersQueryOptions({ page: page + 1 }));
    }
  }, [page, queryClient, hasNextPage]);

  const canEditUsers = currentUser?.is_superuser || currentUser?.can_edit_users;

  // Apply filters and search term to users
  const filteredUsers = users?.data.filter((user: UserPublic) => {
    // Filter by search term
    if (searchTerm && !user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Filter by is_part_of_lab
    if (filters.is_part_of_lab !== null && user.is_part_of_lab !== filters.is_part_of_lab) {
      return false;
    }
    return true;
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
                  null
                )}
              </Flex>
            </Box>
          ))
        )}
      </Flex>
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

function Admin() {
  const [filters, setFilters] = useState<{ is_part_of_lab: boolean | null }>({
    is_part_of_lab: null,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const handleFilterChange = (filterKey: string, filterValue: boolean | null) => {
    if (filterKey === "all") {
      setFilters({ is_part_of_lab: null });
    } else {
      setFilters({ is_part_of_lab: filterValue });
    }
  };

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Users Management
      </Heading>
      {/* SearchBar */}
      <Flex mb={4} mt={6}>
        <SearchBar placeholder="Search by full name..." onSearch={setSearchTerm} />
      </Flex>
      {/* Filters in one line */}
      <Flex gap={4} mb={4} flexDirection="column">
        <BoolFilterComponent type="User" onFilterChange={handleFilterChange} />
      </Flex>
      <UsersGrid filters={filters} searchTerm={searchTerm} />
    </Container>
  );
}