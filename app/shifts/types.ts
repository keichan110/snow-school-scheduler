export interface Shift {
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
}

export interface Department {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftType {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftAssignment {
  id: number;
  shiftId: number;
  instructorId: number;
  assignedAt: string;
  instructor: Instructor;
}

export interface Instructor {
  id: number;
  lastName: string;
  firstName: string;
  status: string;
}

// アサイン済みインストラクター情報（公開ビュー用）
export interface AssignedInstructor {
  id: number;
  lastName: string;
  firstName: string;
  displayName: string; // "lastName firstName" 形式
}

// Base API response type
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  count?: number;
  message: string | null;
  error: string | null;
}

// Department types
export type DepartmentType = "ski" | "snowboard" | "mixed";

// Shift summary and statistics
export interface ShiftSummary {
  type: string;
  department: DepartmentType;
  count: number;
  assignedInstructors?: AssignedInstructor[]; // アサイン済みインストラクター情報
}

export interface DetailedShiftSummary {
  type: string;
  department: DepartmentType;
  count: number;
  instructors: string[]; // インストラクター名の配列
}

export interface ShiftStats {
  [date: string]: {
    shifts: ShiftSummary[];
  };
}

export interface DetailedShiftStats {
  [date: string]: {
    shifts: DetailedShiftSummary[];
  };
}

// Readonly entity interfaces for better immutability
export interface ReadonlyShift
  extends Omit<Shift, "department" | "shiftType" | "assignments"> {
  readonly department: Department;
  readonly shiftType: ShiftType;
  readonly assignments: readonly ShiftAssignment[];
}

// Query parameter types for better type safety
export interface ShiftQueryParams {
  readonly departmentId?: number;
  readonly shiftTypeId?: number;
  readonly dateFrom?: string;
  readonly dateTo?: string;
}

export interface CreateShiftData {
  readonly date: string;
  readonly departmentId: number;
  readonly shiftTypeId: number;
  readonly description?: string | null;
  readonly assignedInstructorIds?: readonly number[];
}

export interface DayData {
  readonly date: string;
  readonly shifts: readonly ShiftSummary[];
  readonly isHoliday: boolean;
}

export interface DetailedDayData {
  readonly date: string;
  readonly shifts: readonly DetailedShiftSummary[];
  readonly isHoliday: boolean;
}

// Form data interfaces
export interface ShiftFormData {
  readonly selectedDate: string;
  readonly dateFormatted: string;
}

// Calendar related types
export interface CalendarDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly date: string;
  readonly weekday: number;
  readonly isHoliday: boolean;
  readonly isToday: boolean;
}
