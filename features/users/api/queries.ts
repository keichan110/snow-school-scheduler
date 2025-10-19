import {
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { fetchUsers } from "@/app/(member)/(manager)/(admin)/users/api";
import type {
  UserFilters,
  UserWithDetails,
} from "@/app/(member)/(manager)/(admin)/users/types";

/**
 * ユーザー一覧向けのクエリキー
 */
export const usersQueryKeys = {
  all: ["users"] as const,
  lists: () => [...usersQueryKeys.all, "list"] as const,
  list: (filters: UserFilters) => [...usersQueryKeys.lists(), filters] as const,
};

export type UsersQueryKey = ReturnType<typeof usersQueryKeys.list>;

type UsersQueryOptions<TData> = Omit<
  UseSuspenseQueryOptions<UserWithDetails[], Error, TData, UsersQueryKey>,
  "queryKey" | "queryFn" | "suspense"
>;

export function useUsersQuery<TData = UserWithDetails[]>(
  filters: UserFilters,
  options: UsersQueryOptions<TData> = {}
): UseSuspenseQueryResult<TData, Error> {
  return useSuspenseQuery<UserWithDetails[], Error, TData, UsersQueryKey>({
    queryKey: usersQueryKeys.list(filters),
    queryFn: () => fetchUsers(filters),
    ...options,
  });
}
