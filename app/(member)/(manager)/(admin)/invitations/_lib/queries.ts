import {
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { fetchInvitations } from "./api";
import type { InvitationTokenWithStats } from "./types";

/**
 * 招待一覧取得用のクエリキー定義
 */
export const invitationsQueryKeys = {
  all: ["invitations"] as const,
  lists: () => [...invitationsQueryKeys.all, "list"] as const,
  list: () => [...invitationsQueryKeys.lists()] as const,
};

export type InvitationsQueryKey = ReturnType<typeof invitationsQueryKeys.list>;

type InvitationsQueryOptions<TData> = Omit<
  UseSuspenseQueryOptions<
    InvitationTokenWithStats[],
    Error,
    TData,
    InvitationsQueryKey
  >,
  "queryKey" | "queryFn" | "suspense"
>;

export function useInvitationsQuery<TData = InvitationTokenWithStats[]>(
  options: InvitationsQueryOptions<TData> = {}
): UseSuspenseQueryResult<TData, Error> {
  return useSuspenseQuery<
    InvitationTokenWithStats[],
    Error,
    TData,
    InvitationsQueryKey
  >({
    queryKey: invitationsQueryKeys.list(),
    queryFn: fetchInvitations,
    ...options,
  });
}
