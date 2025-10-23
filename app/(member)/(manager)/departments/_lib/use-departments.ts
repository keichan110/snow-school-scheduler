"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDepartmentAction,
  deleteDepartmentAction,
  updateDepartmentAction,
} from "./actions";
import type { CreateDepartmentInput, UpdateDepartmentInput } from "./schemas";

export const departmentKeys = {
  all: ["departments"] as const,
  lists: () => [...departmentKeys.all, "list"] as const,
  list: () => [...departmentKeys.lists()] as const,
  details: () => [...departmentKeys.all, "detail"] as const,
  detail: (id: number) => [...departmentKeys.details(), id] as const,
};

/**
 * 部門作成フック
 */
export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: CreateDepartmentInput) => createDepartmentAction(vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: departmentKeys.all });
    },
  });
}

/**
 * 部門更新フック
 */
export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDepartmentInput }) =>
      updateDepartmentAction(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: departmentKeys.all });
      qc.invalidateQueries({ queryKey: departmentKeys.detail(id) });
    },
  });
}

/**
 * 部門削除フック
 */
export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteDepartmentAction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: departmentKeys.all });
    },
  });
}
