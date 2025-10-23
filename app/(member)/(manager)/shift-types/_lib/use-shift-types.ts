"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createShiftTypeAction,
  deleteShiftTypeAction,
  updateShiftTypeAction,
} from "./actions";
import type { CreateShiftTypeInput, UpdateShiftTypeInput } from "./schemas";

// Re-export queries
export {
  type ShiftTypesQueryKey,
  shiftTypesQueryKeys,
  useShiftTypesQuery,
} from "./queries";

export const shiftTypeKeys = {
  all: ["shift-types"] as const,
  lists: () => [...shiftTypeKeys.all, "list"] as const,
  list: () => [...shiftTypeKeys.lists()] as const,
  details: () => [...shiftTypeKeys.all, "detail"] as const,
  detail: (id: number) => [...shiftTypeKeys.details(), id] as const,
};

/**
 * シフト種別作成フック
 */
export function useCreateShiftType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: CreateShiftTypeInput) => createShiftTypeAction(vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shiftTypeKeys.all });
    },
  });
}

/**
 * シフト種別更新フック
 */
export function useUpdateShiftType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateShiftTypeInput }) =>
      updateShiftTypeAction(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: shiftTypeKeys.all });
      qc.invalidateQueries({ queryKey: shiftTypeKeys.detail(id) });
    },
  });
}

/**
 * シフト種別削除フック
 */
export function useDeleteShiftType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteShiftTypeAction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shiftTypeKeys.all });
    },
  });
}
