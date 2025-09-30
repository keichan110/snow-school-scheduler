/**
 * Shiftsドメインの型定義
 */

import type {
  BaseEntity,
  DateRange,
  DepartmentId,
  InstructorId,
  ShiftAssignmentId,
  ShiftId,
  ShiftTypeId,
} from "@/shared/types/common";

/**
 * シフト種別
 */
export interface ShiftType extends BaseEntity {
  readonly id: ShiftTypeId;
  readonly name: string;
  readonly isActive: boolean;
}

/**
 * シフト
 */
export interface Shift extends BaseEntity {
  readonly id: ShiftId;
  readonly date: Date;
  readonly departmentId: DepartmentId;
  readonly shiftTypeId: ShiftTypeId;
  readonly description?: string;
  readonly department?: Department; // relation
  readonly shiftType?: ShiftType; // relation
  readonly assignments?: readonly ShiftAssignment[]; // relation
}

/**
 * シフト割り当て
 */
export interface ShiftAssignment {
  readonly id: ShiftAssignmentId;
  readonly shiftId: ShiftId;
  readonly instructorId: InstructorId;
  readonly assignedAt: Date;
  readonly shift?: Shift; // relation
  readonly instructor?: Instructor; // relation
}

/**
 * 部門（shifts機能で使用）
 */
export interface Department extends BaseEntity {
  readonly id: DepartmentId;
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly isActive: boolean;
}

/**
 * インストラクター（shifts機能で使用）
 */
export interface Instructor extends BaseEntity {
  readonly id: InstructorId;
  readonly lastName: string;
  readonly firstName: string;
  readonly lastNameKana?: string;
  readonly firstNameKana?: string;
  readonly status: "ACTIVE" | "INACTIVE" | "RETIRED";
  readonly notes?: string;
}

/**
 * シフトと関連データをまとめた表示用型
 */
export interface ShiftWithDetails extends Shift {
  readonly department: Department;
  readonly shiftType: ShiftType;
  readonly assignments: readonly (ShiftAssignment & {
    instructor: Pick<
      Instructor,
      "id" | "lastName" | "firstName" | "lastNameKana" | "firstNameKana"
    >;
  })[];
}

/**
 * シフト検索・フィルタ条件
 */
export interface ShiftFilter {
  readonly dateRange?: DateRange;
  readonly departmentIds?: readonly DepartmentId[];
  readonly shiftTypeIds?: readonly ShiftTypeId[];
  readonly instructorIds?: readonly InstructorId[];
  readonly hasAssignments?: boolean;
  readonly isActive?: boolean;
}

/**
 * シフト作成・更新用のInput型
 */
export interface ShiftCreateInput {
  readonly date: Date;
  readonly departmentId: DepartmentId;
  readonly shiftTypeId: ShiftTypeId;
  readonly description?: string;
}

export interface ShiftUpdateInput extends Partial<ShiftCreateInput> {
  readonly id: ShiftId;
}

/**
 * シフト割り当て操作用の型
 */
export interface ShiftAssignmentInput {
  readonly shiftId: ShiftId;
  readonly instructorId: InstructorId;
}

export interface ShiftAssignmentBulkInput {
  readonly shiftId: ShiftId;
  readonly instructorIds: readonly InstructorId[];
}

/**
 * シフトカレンダー表示用の型
 */
export interface CalendarShift {
  readonly id: ShiftId;
  readonly date: Date;
  readonly title: string;
  readonly department: Pick<Department, "id" | "name" | "code">;
  readonly shiftType: Pick<ShiftType, "id" | "name">;
  readonly instructorCount: number;
  readonly description?: string;
}

/**
 * 週表示用の型
 */
export interface WeeklyShiftData {
  readonly weekStart: Date;
  readonly weekEnd: Date;
  readonly shifts: readonly CalendarShift[];
}

/**
 * 月表示用の型
 */
export interface MonthlyShiftData {
  readonly year: number;
  readonly month: number;
  readonly weeks: readonly WeeklyShiftData[];
}
