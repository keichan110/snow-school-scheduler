import {
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
  useSuspenseQuery,
} from "@tanstack/react-query";

import type { CertificationWithDepartment } from "@/app/certifications/types";

type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  message: string | null;
  error: string | null;
};

/**
 * 資格一覧を取得
 */
export async function fetchCertifications(): Promise<
  CertificationWithDepartment[]
> {
  const response = await fetch("/api/certifications");
  const result: ApiResponse<CertificationWithDepartment[]> =
    await response.json();

  if (!(result.success && result.data)) {
    throw new Error(result.error || "Failed to fetch certifications");
  }

  return result.data;
}

/**
 * 資格一覧向けのクエリキー
 */
export const certificationsQueryKeys = {
  all: ["certifications"] as const,
  list: () => [...certificationsQueryKeys.all, "list"] as const,
};

export type CertificationsQueryKey = ReturnType<
  typeof certificationsQueryKeys.list
>;

type CertificationsQueryOptions<TData> = Omit<
  UseSuspenseQueryOptions<
    CertificationWithDepartment[],
    Error,
    TData,
    CertificationsQueryKey
  >,
  "queryKey" | "queryFn" | "suspense"
>;

export function useCertificationsQuery<TData = CertificationWithDepartment[]>(
  options: CertificationsQueryOptions<TData> = {}
): UseSuspenseQueryResult<TData, Error> {
  return useSuspenseQuery<
    CertificationWithDepartment[],
    Error,
    TData,
    CertificationsQueryKey
  >({
    queryKey: certificationsQueryKeys.list(),
    queryFn: fetchCertifications,
    ...options,
  });
}
