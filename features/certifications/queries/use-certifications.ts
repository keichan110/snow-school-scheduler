"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCertificationAction,
  deleteCertificationAction,
  updateCertificationAction,
} from "../actions";
import type {
  CreateCertificationInput,
  UpdateCertificationInput,
} from "../schemas";

export const certificationKeys = {
  all: ["certifications"] as const,
  lists: () => [...certificationKeys.all, "list"] as const,
  list: () => [...certificationKeys.lists()] as const,
  details: () => [...certificationKeys.all, "detail"] as const,
  detail: (id: number) => [...certificationKeys.details(), id] as const,
};

/**
 * 資格作成フック
 */
export function useCreateCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: CreateCertificationInput) =>
      createCertificationAction(vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: certificationKeys.all });
    },
  });
}

/**
 * 資格更新フック
 */
export function useUpdateCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateCertificationInput;
    }) => updateCertificationAction(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: certificationKeys.all });
      qc.invalidateQueries({ queryKey: certificationKeys.detail(id) });
    },
  });
}

/**
 * 資格削除フック
 */
export function useDeleteCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCertificationAction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: certificationKeys.all });
    },
  });
}
