import {
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
  useSuspenseQuery,
} from "@tanstack/react-query";

import type { InstructorWithCertifications } from "@/app/(member)/(manager)/instructors/types";

type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  message: string | null;
  error: string | null;
};

/**
 * インストラクター一覧を取得
 */
export async function fetchInstructors(): Promise<
  InstructorWithCertifications[]
> {
  const response = await fetch("/api/instructors");
  const result: ApiResponse<InstructorWithCertifications[]> =
    await response.json();

  if (!(result.success && result.data)) {
    throw new Error(result.error || "Failed to fetch instructors");
  }

  return result.data;
}

/**
 * 管理画面向けインストラクター一覧クエリキー定義
 */
export const instructorsQueryKeys = {
  all: ["instructors"] as const,
  list: () => [...instructorsQueryKeys.all, "list"] as const,
};

export type InstructorsQueryKey = ReturnType<typeof instructorsQueryKeys.list>;

type InstructorsQueryOptions<TData> = Omit<
  UseSuspenseQueryOptions<
    InstructorWithCertifications[],
    Error,
    TData,
    InstructorsQueryKey
  >,
  "queryKey" | "queryFn" | "suspense"
>;

export function useInstructorsQuery<TData = InstructorWithCertifications[]>(
  options: InstructorsQueryOptions<TData> = {}
): UseSuspenseQueryResult<TData, Error> {
  return useSuspenseQuery<
    InstructorWithCertifications[],
    Error,
    TData,
    InstructorsQueryKey
  >({
    queryKey: instructorsQueryKeys.list(),
    queryFn: fetchInstructors,
    ...options,
  });
}
