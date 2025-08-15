// 共通シフト表示コンポーネント用の型定義

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

// Department types
export type DepartmentType = 'ski' | 'snowboard' | 'mixed';

// Shift summary and statistics
export interface ShiftSummary {
  type: string;
  department: DepartmentType;
  count: number;
}

export interface ShiftStats {
  [date: string]: {
    shifts: ShiftSummary[];
  };
}

// Base props for shared components
export interface BaseShiftDisplayProps {
  year: number;
  month: number;
  shiftStats: ShiftStats;
  holidays: Record<string, boolean>;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}
