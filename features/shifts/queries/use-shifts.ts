"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createShiftAction,
  deleteShiftAction,
  updateShiftAction,
} from "../actions";
import type { CreateShiftInput, UpdateShiftInput } from "../schemas";

export const shiftKeys = {
  all: ["shifts"] as const,
  lists: () => [...shiftKeys.all, "list"] as const,
  list: () => [...shiftKeys.lists()] as const,
  details: () => [...shiftKeys.all, "detail"] as const,
  detail: (id: number) => [...shiftKeys.details(), id] as const,
};

/**
 * シフト作成フック
 */
export function useCreateShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: CreateShiftInput) => createShiftAction(vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shiftKeys.all });
    },
  });
}

/**
 * シフト更新フック
 */
export function useUpdateShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateShiftInput }) =>
      updateShiftAction(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: shiftKeys.all });
      qc.invalidateQueries({ queryKey: shiftKeys.detail(id) });
    },
  });
}

/**
 * シフト削除フック
 */
export function useDeleteShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteShiftAction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shiftKeys.all });
    },
  });
}
