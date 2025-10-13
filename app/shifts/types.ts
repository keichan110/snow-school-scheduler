export type Shift = {
  id: number;
  date: string;
  departmentId: number;
  shiftTypeId: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  department: Department;
  shiftType: ShiftType;
  assignments: ShiftAssignment[];
  assignedCount: number;
};

export type Department = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type ShiftType = {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ShiftAssignment = {
  id: number;
  shiftId: number;
  instructorId: number;
  assignedAt: string;
  instructor: Instructor;
};

export type Instructor = {
  id: number;
  lastName: string;
  firstName: string;
  status: string;
};

// アサイン済みインストラクター情報（公開ビュー用）
export type AssignedInstructor = {
  id: number;
  lastName: string;
  firstName: string;
  displayName: string; // "lastName firstName" 形式
};

// Base API response type
export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  count?: number;
  message: string | null;
  error: string | null;
};

// Department types
export type DepartmentType = "ski" | "snowboard" | "mixed";

// Shift summary and statistics
export type ShiftSummary = {
  type: string;
  department: DepartmentType;
  count: number;
  assignedInstructors?: AssignedInstructor[]; // アサイン済みインストラクター情報
};

export type DetailedShiftSummary = {
  type: string;
  department: DepartmentType;
  count: number;
  instructors: string[]; // インストラクター名の配列
};

export type ShiftStats = {
  [date: string]: {
    shifts: ShiftSummary[];
  };
};

export type DetailedShiftStats = {
  [date: string]: {
    shifts: DetailedShiftSummary[];
  };
};

// Readonly entity interfaces for better immutability
export interface ReadonlyShift
  extends Omit<Shift, "department" | "shiftType" | "assignments"> {
  readonly department: Department;
  readonly shiftType: ShiftType;
  readonly assignments: readonly ShiftAssignment[];
}

// Query parameter types for better type safety
export type ShiftQueryParams = {
  readonly departmentId?: number;
  readonly shiftTypeId?: number;
  readonly dateFrom?: string;
  readonly dateTo?: string;
};

export type CreateShiftData = {
  readonly date: string;
  readonly departmentId: number;
  readonly shiftTypeId: number;
  readonly description?: string | null;
  readonly assignedInstructorIds?: readonly number[];
};

export type DayData = {
  readonly date: string;
  readonly shifts: readonly ShiftSummary[];
  readonly isHoliday: boolean;
};

export type DetailedDayData = {
  readonly date: string;
  readonly shifts: readonly DetailedShiftSummary[];
  readonly isHoliday: boolean;
};

// Form data interfaces
export type ShiftFormData = {
  readonly selectedDate: string;
  readonly dateFormatted: string;
};

// Calendar related types
export type CalendarDate = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly date: string;
  readonly weekday: number;
  readonly isHoliday: boolean;
  readonly isToday: boolean;
};
