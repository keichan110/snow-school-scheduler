import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import type { ApiResponse } from "@/lib/api/types";

// 簡素化されたシフト型（実際のAPIレスポンスに合わせる）
type Shift = {
  id: number;
  date: string;
  departmentId: number;
  shiftTypeId: number;
  description?: string;
  department?: { id: number; name: string };
  shiftType?: { id: number; name: string };
  assignments?: Array<{
    id: number;
    instructorId: number;
    instructor: { id: number; firstName: string; lastName: string };
  }>;
  assignedCount: number;
};

// シフト作成リクエスト型
type CreateShiftRequest = {
  date: string;
  departmentId: number;
  shiftTypeId: number;
  description?: string;
  assignedInstructorIds?: number[];
};

// シフト取得用のクエリキー生成関数
export const shiftsQueryKeys = {
  all: ["shifts"] as const,
  lists: () => [...shiftsQueryKeys.all, "list"] as const,
  list: (filters: ShiftFilters) =>
    [...shiftsQueryKeys.lists(), filters] as const,
  details: () => [...shiftsQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...shiftsQueryKeys.details(), id] as const,
};

type ShiftFilters = {
  departmentId?: number;
  shiftTypeId?: number;
  dateFrom?: string;
  dateTo?: string;
};

// シフト一覧取得用のフック
export function useShifts(filters: ShiftFilters = {}) {
  return useQuery({
    queryKey: shiftsQueryKeys.list(filters),
    queryFn: async (): Promise<Shift[]> => {
      const params = new URLSearchParams();

      if (filters.departmentId) {
        params.append("departmentId", filters.departmentId.toString());
      }
      if (filters.shiftTypeId) {
        params.append("shiftTypeId", filters.shiftTypeId.toString());
      }
      if (filters.dateFrom) {
        params.append("dateFrom", filters.dateFrom);
      }
      if (filters.dateTo) {
        params.append("dateTo", filters.dateTo);
      }

      const response = await fetch(`/api/shifts?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch shifts");
      }

      const data: ApiResponse<Shift[]> = await response.json();
      if (!(data.success && data.data)) {
        throw new Error(data.error || "Failed to fetch shifts");
      }

      return data.data;
    },
    // 設計書の通り、5分のstaleTime
    // biome-ignore lint/style/noMagicNumbers: キャッシュ時間設定のため
    staleTime: 5 * 60 * 1000,
    // 30分のキャッシュ時間
    // biome-ignore lint/style/noMagicNumbers: キャッシュ時間設定のため
    gcTime: 30 * 60 * 1000,
  });
}

// 日付別シフト取得用のフック（カレンダー表示用）
export function useShiftsByDate(date: Date) {
  const dateString = format(date, "yyyy-MM-dd");

  return useShifts({
    dateFrom: dateString,
    dateTo: dateString,
  });
}

// 週間シフト取得用のフック
export function useShiftsByWeek(startDate: Date, endDate: Date) {
  const startDateString = format(startDate, "yyyy-MM-dd");
  const endDateString = format(endDate, "yyyy-MM-dd");

  return useShifts({
    dateFrom: startDateString,
    dateTo: endDateString,
  });
}

// 単一シフト取得用のフック
export function useShift(id: number) {
  return useQuery({
    queryKey: shiftsQueryKeys.detail(id),
    queryFn: async (): Promise<Shift> => {
      const response = await fetch(`/api/shifts/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch shift");
      }

      const data: ApiResponse<Shift> = await response.json();
      if (!(data.success && data.data)) {
        throw new Error(data.error || "Failed to fetch shift");
      }

      return data.data;
    },
    // biome-ignore lint/style/noMagicNumbers: キャッシュ時間設定のため
    staleTime: 5 * 60 * 1000,
    // biome-ignore lint/style/noMagicNumbers: キャッシュ時間設定のため
    gcTime: 30 * 60 * 1000,
  });
}

// シフト作成用のフック
export function useCreateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shiftData: CreateShiftRequest): Promise<Shift> => {
      const response = await fetch("/api/shifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shiftData),
      });

      if (!response.ok) {
        throw new Error("Failed to create shift");
      }

      const data: ApiResponse<Shift> = await response.json();
      if (!(data.success && data.data)) {
        throw new Error(data.error || "Failed to create shift");
      }

      return data.data;
    },
    onSuccess: (newShift) => {
      // 関連するクエリを無効化してリフレッシュ
      queryClient.invalidateQueries({ queryKey: shiftsQueryKeys.all });

      // 新しいシフトをキャッシュに追加
      queryClient.setQueryData(shiftsQueryKeys.detail(newShift.id), newShift);
    },
  });
}

// シフト更新用のフック
export function useUpdateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateShiftRequest>;
    }): Promise<Shift> => {
      const response = await fetch(`/api/shifts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update shift");
      }

      const responseData: ApiResponse<Shift> = await response.json();
      if (!(responseData.success && responseData.data)) {
        throw new Error(responseData.error || "Failed to update shift");
      }

      return responseData.data;
    },
    onSuccess: (updatedShift) => {
      // 関連するクエリを無効化
      queryClient.invalidateQueries({ queryKey: shiftsQueryKeys.all });

      // 更新されたシフトをキャッシュに設定
      queryClient.setQueryData(
        shiftsQueryKeys.detail(updatedShift.id),
        updatedShift
      );
    },
  });
}

// シフト削除用のフック
export function useDeleteShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await fetch(`/api/shifts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete shift");
      }

      const data: ApiResponse<null> = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to delete shift");
      }
    },
    onSuccess: (_, deletedId) => {
      // 関連するクエリを無効化
      queryClient.invalidateQueries({ queryKey: shiftsQueryKeys.all });

      // 削除されたシフトをキャッシュから除去
      queryClient.removeQueries({
        queryKey: shiftsQueryKeys.detail(deletedId),
      });
    },
  });
}
