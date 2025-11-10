import {
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { type ApiError, fetchShifts } from "./api";
import type { Department, Shift, ShiftQueryParams } from "./types";
import { shiftFormDataKeys } from "./use-shift-form-data";

/**
 * 公開シフト一覧クエリのフィルタ型
 */
type MutablePublicShiftsQueryFilters = {
  departmentId?: number;
  shiftTypeId?: number;
  dateFrom?: string;
  dateTo?: string;
};

export type PublicShiftsQueryFilters =
  Readonly<MutablePublicShiftsQueryFilters>;

const EMPTY_FILTERS: PublicShiftsQueryFilters = Object.freeze({});

/**
 * 公開シフト向けのクエリキー定義
 */
export const publicShiftsQueryKeys = {
  all: ["public-shifts"] as const,
  list: (filters: PublicShiftsQueryFilters = EMPTY_FILTERS) =>
    [...publicShiftsQueryKeys.all, "list", filters] as const,
};

export type PublicShiftsQueryKey = ReturnType<
  typeof publicShiftsQueryKeys.list
>;

/**
 * 公開ビューで利用する部門クエリキー
 * @deprecated Use shiftFormDataKeys from use-shift-form-data instead
 */
export const publicShiftsDepartmentsQueryKeys = {
  all: shiftFormDataKeys.all,
};

export type PublicShiftsDepartmentsQueryKey =
  typeof publicShiftsDepartmentsQueryKeys.all;

function normalizeShiftQueryParams(
  params?: ShiftQueryParams
): PublicShiftsQueryFilters {
  if (!params) {
    return EMPTY_FILTERS;
  }

  const normalized: MutablePublicShiftsQueryFilters = {};

  if (params.departmentId !== undefined) {
    normalized.departmentId = params.departmentId;
  }
  if (params.shiftTypeId !== undefined) {
    normalized.shiftTypeId = params.shiftTypeId;
  }
  if (params.dateFrom) {
    normalized.dateFrom = params.dateFrom;
  }
  if (params.dateTo) {
    normalized.dateTo = params.dateTo;
  }

  return Object.keys(normalized).length === 0 ? EMPTY_FILTERS : normalized;
}

type PublicShiftsQueryOptions<TData> = Omit<
  UseSuspenseQueryOptions<Shift[], ApiError, TData, PublicShiftsQueryKey>,
  "queryKey" | "queryFn" | "suspense"
>;

export interface UsePublicShiftsQueryOptions<TData = Shift[]>
  extends PublicShiftsQueryOptions<TData> {
  readonly params?: ShiftQueryParams;
}

export function usePublicShiftsQuery<TData = Shift[]>(
  options: UsePublicShiftsQueryOptions<TData> = {}
): UseSuspenseQueryResult<TData, ApiError> {
  const { params, ...queryOptions } = options;
  const filters = normalizeShiftQueryParams(params);

  // Suspense モードは useSuspenseQuery が内部で強制するため、明示的な指定は不要
  return useSuspenseQuery<Shift[], ApiError, TData, PublicShiftsQueryKey>({
    queryKey: publicShiftsQueryKeys.list(filters),
    queryFn: () => fetchShifts(params),
    ...queryOptions,
  });
}

type DepartmentsQueryOptions<TData> = Omit<
  UseSuspenseQueryOptions<
    Department[],
    ApiError,
    TData,
    PublicShiftsDepartmentsQueryKey
  >,
  "queryKey" | "queryFn" | "suspense"
>;

/**
 * 部門一覧を取得するReact Queryフック
 *
 * @description
 * `/api/usecases/shifts/form-data` エンドポイントから部門一覧を取得します。
 * このフックは`useShiftFormData`のデータをselect関数で部門のみに絞り込んでいます。
 *
 * @deprecated 直接 useShiftFormData を使用することを推奨します
 */
export function useDepartmentsQuery<TData = Department[]>(
  options: DepartmentsQueryOptions<TData> = {}
): UseSuspenseQueryResult<TData, ApiError> {
  // Suspense モードは useSuspenseQuery が内部で強制するため、明示的な指定は不要
  return useSuspenseQuery<
    Department[],
    ApiError,
    TData,
    PublicShiftsDepartmentsQueryKey
  >({
    queryKey: publicShiftsDepartmentsQueryKeys.all,
    queryFn: async () => {
      // /api/usecases/shifts/form-data エンドポイントを呼び出し
      const response = await fetch("/api/usecases/shifts/form-data");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch form data");
      }

      // departments のみを返す
      return result.data.departments;
    },
    ...options,
  });
}
