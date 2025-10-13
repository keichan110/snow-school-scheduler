/**
 * Shifts API の型定義
 */

import type { ApiResponse, BaseQueryParams } from "@/shared/types";
import type {
  CalendarShift,
  MonthlyShiftData,
  Shift,
  ShiftAssignmentBulkInput,
  ShiftAssignmentInput,
  ShiftCreateInput,
  ShiftType,
  ShiftUpdateInput,
  ShiftWithDetails,
  WeeklyShiftData,
} from "../types/domain";

/**
 * Shifts API クエリパラメータ
 */
export interface ShiftQueryParams extends BaseQueryParams {
  readonly startDate?: string; // ISO date string
  readonly endDate?: string; // ISO date string
  readonly departmentId?: number;
  readonly shiftTypeId?: number;
  readonly instructorId?: number;
  readonly includeAssignments?: boolean;
  readonly includeInactive?: boolean;
}

/**
 * Calendar API クエリパラメータ
 */
export type CalendarQueryParams = {
  readonly year: number;
  readonly month: number;
  readonly departmentId?: number;
  readonly view?: "month" | "week" | "day";
};

/**
 * Weekly API クエリパラメータ
 */
export type WeeklyQueryParams = {
  readonly startDate: string; // ISO date string (Monday of the week)
  readonly departmentId?: number;
};

/**
 * API レスポンス型
 */

// Shifts
export type ShiftsResponse = ApiResponse<readonly Shift[]>;
export type ShiftResponse = ApiResponse<Shift>;
export type ShiftWithDetailsResponse = ApiResponse<ShiftWithDetails>;
export type ShiftCreateResponse = ApiResponse<Shift>;
export type ShiftUpdateResponse = ApiResponse<Shift>;

// Calendar
export type CalendarShiftsResponse = ApiResponse<readonly CalendarShift[]>;
export type WeeklyShiftsResponse = ApiResponse<WeeklyShiftData>;
export type MonthlyShiftsResponse = ApiResponse<MonthlyShiftData>;

// Shift Types
export type ShiftTypesResponse = ApiResponse<readonly ShiftType[]>;
export type ShiftTypeResponse = ApiResponse<ShiftType>;

// Assignments
export type ShiftAssignmentResponse = ApiResponse<{ success: boolean }>;

/**
 * API リクエストボディ型
 */

// Shift作成リクエスト
export type CreateShiftRequest = {
  readonly body: ShiftCreateInput;
};

// Shift更新リクエスト
export type UpdateShiftRequest = {
  readonly params: { readonly id: string };
  readonly body: ShiftUpdateInput;
};

// Shift削除リクエスト
export type DeleteShiftRequest = {
  readonly params: { readonly id: string };
};

// Shift割り当てリクエスト
export type AssignShiftRequest = {
  readonly params: { readonly id: string };
  readonly body: ShiftAssignmentInput;
};

// 一括Shift割り当てリクエスト
export type BulkAssignShiftRequest = {
  readonly params: { readonly id: string };
  readonly body: ShiftAssignmentBulkInput;
};

// Shift割り当て解除リクエスト
export type UnassignShiftRequest = {
  readonly params: {
    readonly id: string;
    readonly instructorId: string;
  };
};

/**
 * エラーレスポンス
 */
export type ShiftErrorResponse = {
  readonly code: string;
  readonly message: string;
  readonly errors?: {
    readonly field?: string;
    readonly message?: string;
    readonly constraint?: string;
  };
};

/**
 * バリデーションエラー
 */
export type ShiftValidationError = {
  readonly field: string;
  readonly message: string;
  readonly code:
    | "INVALID_INPUT"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT";
};
