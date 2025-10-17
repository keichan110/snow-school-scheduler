"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createInstructorAction,
  deleteInstructorAction,
  updateInstructorAction,
} from "../actions";
import type { CreateInstructorInput, UpdateInstructorInput } from "../schemas";

export const instructorKeys = {
  all: ["instructors"] as const,
  lists: () => [...instructorKeys.all, "list"] as const,
  list: () => [...instructorKeys.lists()] as const,
  details: () => [...instructorKeys.all, "detail"] as const,
  detail: (id: number) => [...instructorKeys.details(), id] as const,
};

/**
 * インストラクター作成フック
 */
export function useCreateInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: CreateInstructorInput) => createInstructorAction(vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: instructorKeys.all });
    },
  });
}

/**
 * インストラクター更新フック
 */
export function useUpdateInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInstructorInput }) =>
      updateInstructorAction(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: instructorKeys.all });
      qc.invalidateQueries({ queryKey: instructorKeys.detail(id) });
    },
  });
}

/**
 * インストラクター削除フック
 */
export function useDeleteInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteInstructorAction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: instructorKeys.all });
    },
  });
}
