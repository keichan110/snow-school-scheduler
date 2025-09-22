import {
  useSuspenseQuery,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
} from '@tanstack/react-query';

import { fetchInstructors } from '@/app/instructors/api';
import type { InstructorWithCertifications } from '@/app/instructors/types';

/**
 * 管理画面向けインストラクター一覧クエリキー定義
 */
export const instructorsQueryKeys = {
  all: ['instructors'] as const,
  list: () => [...instructorsQueryKeys.all, 'list'] as const,
};

export type InstructorsQueryKey = ReturnType<typeof instructorsQueryKeys.list>;

type InstructorsQueryOptions<TData> = Omit<
  UseSuspenseQueryOptions<InstructorWithCertifications[], Error, TData, InstructorsQueryKey>,
  'queryKey' | 'queryFn' | 'suspense'
>;

export function useInstructorsQuery<TData = InstructorWithCertifications[]>(
  options: InstructorsQueryOptions<TData> = {}
): UseSuspenseQueryResult<TData, Error> {
  return useSuspenseQuery<InstructorWithCertifications[], Error, TData, InstructorsQueryKey>({
    queryKey: instructorsQueryKeys.list(),
    queryFn: fetchInstructors,
    ...options,
  });
}
