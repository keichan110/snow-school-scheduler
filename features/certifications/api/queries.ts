import {
  useSuspenseQuery,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
} from '@tanstack/react-query';

import { fetchCertifications } from '@/app/certifications/api';
import type { CertificationWithDepartment } from '@/app/certifications/types';

/**
 * 資格一覧向けのクエリキー
 */
export const certificationsQueryKeys = {
  all: ['certifications'] as const,
  list: () => [...certificationsQueryKeys.all, 'list'] as const,
};

export type CertificationsQueryKey = ReturnType<typeof certificationsQueryKeys.list>;

type CertificationsQueryOptions<TData> = Omit<
  UseSuspenseQueryOptions<
    CertificationWithDepartment[],
    Error,
    TData,
    CertificationsQueryKey
  >,
  'queryKey' | 'queryFn' | 'suspense'
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
