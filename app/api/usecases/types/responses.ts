import type { ApiErrorResponse } from "@/lib/api/types";

/**
 * シフト作成フォームデータのレスポンス型
 */
export type ShiftFormDataResponse =
  | {
      success: true;
      data: {
        departments: Array<{
          id: number;
          name: string;
          code: string;
        }>;
        shiftTypes: Array<{
          id: number;
          name: string;
        }>;
        stats: {
          activeInstructorsCount: number;
          totalDepartments: number;
          totalShiftTypes: number;
        };
      };
    }
  | ApiErrorResponse;

/**
 * 部門別アクティブインストラクターのレスポンス型
 */
export type ActiveInstructorsByDepartmentResponse =
  | {
      success: true;
      data: {
        instructors: Array<{
          id: number;
          displayName: string;
          displayNameKana: string;
          status: string;
          certificationSummary: string;
        }>;
        metadata: {
          departmentId: number;
          departmentName: string;
          totalCount: number;
          activeCount: number;
        };
      };
    }
  | ApiErrorResponse;

/**
 * カレンダービューのレスポンス型
 */
export type CalendarViewResponse =
  | {
      success: true;
      data: {
        shifts: Array<{
          id: number;
          date: string;
          department: {
            id: number;
            name: string;
            code: string;
          };
          shiftType: {
            id: number;
            name: string;
          };
          assignedInstructors: Array<{
            id: number;
            displayName: string;
          }>;
          stats: {
            assignedCount: number;
            hasNotes: boolean;
          };
          description: string | null;
        }>;
        summary: {
          totalShifts: number;
          totalAssignments: number;
          dateRange: {
            from: string;
            to: string;
          };
          byDepartment: Record<string, number>;
        };
      };
    }
  | ApiErrorResponse;

/**
 * シフト編集データのレスポンス型
 */
export type ShiftEditDataResponse =
  | {
      success: true;
      data: {
        mode: "edit" | "create";
        shift: {
          id: number;
          date: string;
          departmentId: number;
          shiftTypeId: number;
          description: string | null;
          assignedInstructorIds: number[];
        } | null;
        availableInstructors: Array<{
          id: number;
          displayName: string;
          certificationSummary: string;
          isAssigned: boolean;
          hasConflict: boolean;
        }>;
        conflicts: Array<{
          instructorId: number;
          instructorName: string;
          conflictingShift: {
            id: number;
            departmentName: string;
            shiftTypeName: string;
          };
        }>;
        formData: {
          date: string;
          departmentId: number;
          shiftTypeId: number;
          description: string | null;
          selectedInstructorIds: number[];
        };
      };
    }
  | ApiErrorResponse;
