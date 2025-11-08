import type { ApiErrorResponse } from "@/lib/api/types";
import type { DepartmentMinimal, ShiftTypeMinimal } from "@/lib/types/domain";

/**
 * シフト作成フォームデータのレスポンス型
 *
 * @description
 * `/api/usecases/shifts/form-data` エンドポイントのレスポンス型。
 * API契約型として生産者側（API）に配置し、複数のクライアントから参照可能にする。
 */
export type ShiftFormDataResponse =
  | {
      success: true;
      data: {
        departments: DepartmentMinimal[];
        shiftTypes: ShiftTypeMinimal[];
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
 *
 * @description
 * 資格の有無に関わらず、アクティブなインストラクター全員を返します。
 * `certificationSummary` が "なし" の場合は資格未保有を示します。
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
          /** 資格情報の要約 ("なし" または "資格名, 資格名, ...") */
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
