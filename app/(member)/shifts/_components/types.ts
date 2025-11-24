// 共通シフト表示コンポーネント用の型定義

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
  code: string;
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

// Department types
// DepartmentType is now simplified to use department.code directly
export type DepartmentType = "ski" | "snowboard";

// Shift summary and statistics
export type ShiftSummary = {
  type: string;
  department: DepartmentType;
  count: number;
};

export type ShiftStats = {
  [date: string]: {
    shifts: ShiftSummary[];
  };
};

// Base props for shared components
export type BaseShiftDisplayProps = {
  year: number;
  month: number;
  shiftStats: ShiftStats;
  isHoliday: (date: string) => boolean;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
};

/**
 * シフトカレンダーグリッドコンポーネントのProps型
 * BaseShiftDisplayPropsを継承
 */
export type ShiftCalendarGridProps = BaseShiftDisplayProps;

/**
 * シフトモバイルリストコンポーネントのProps型
 * BaseShiftDisplayPropsを継承
 */
export type ShiftMobileListProps = BaseShiftDisplayProps;
