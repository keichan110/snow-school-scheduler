export interface Shift {
  id: number
  date: string
  departmentId: number
  shiftTypeId: number
  description: string | null
  createdAt: string
  updatedAt: string
  department: Department
  shiftType: ShiftType
  assignments: ShiftAssignment[]
  assignedCount: number
}

export interface Department {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface ShiftType {
  id: number
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ShiftAssignment {
  id: number
  shiftId: number
  instructorId: number
  assignedAt: string
  instructor: Instructor
}

export interface Instructor {
  id: number
  lastName: string
  firstName: string
  status: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  count?: number
  message: string | null
  error: string | null
}

export interface ShiftStats {
  [date: string]: {
    shifts: ShiftSummary[]
  }
}

export interface ShiftSummary {
  type: string
  department: 'ski' | 'snowboard' | 'mixed'
  count: number
}

export interface DayData {
  date: string
  shifts: ShiftSummary[]
  isHoliday: boolean
}

export interface ShiftFormData {
  selectedDate: string
  dateFormatted: string
}