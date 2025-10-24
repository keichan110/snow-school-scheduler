import {
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { fetchShiftTypes } from "@/app/(member)/(manager)/shift-types/_lib/api";
import type { ShiftType } from "@/app/(member)/(manager)/shift-types/_lib/types";

/**
 * シフト種類一覧向けのクエリキー
 */
export const shiftTypesQueryKeys = {
  all: ["shift-types"] as const,
  list: () => [...shiftTypesQueryKeys.all, "list"] as const,
};

export type ShiftTypesQueryKey = ReturnType<typeof shiftTypesQueryKeys.list>;

type ShiftTypesQueryOptions<TData> = Omit<
  UseSuspenseQueryOptions<ShiftType[], Error, TData, ShiftTypesQueryKey>,
  "queryKey" | "queryFn" | "suspense"
>;

export function useShiftTypesQuery<TData = ShiftType[]>(
  options: ShiftTypesQueryOptions<TData> = {}
): UseSuspenseQueryResult<TData, Error> {
  return useSuspenseQuery<ShiftType[], Error, TData, ShiftTypesQueryKey>({
    queryKey: shiftTypesQueryKeys.list(),
    queryFn: fetchShiftTypes,
    ...options,
  });
}
