import { ApiResponse, Shift, Department, ShiftType } from './types'

const API_BASE = '/api'

export async function fetchShifts(params?: {
  departmentId?: number
  shiftTypeId?: number
  dateFrom?: string
  dateTo?: string
}): Promise<Shift[]> {
  const searchParams = new URLSearchParams()
  
  if (params) {
    if (params.departmentId) searchParams.append('departmentId', params.departmentId.toString())
    if (params.shiftTypeId) searchParams.append('shiftTypeId', params.shiftTypeId.toString())
    if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom)
    if (params.dateTo) searchParams.append('dateTo', params.dateTo)
  }

  const response = await fetch(`${API_BASE}/shifts?${searchParams}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch shifts: ${response.statusText}`)
  }

  const result: ApiResponse<Shift[]> = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch shifts')
  }

  return result.data || []
}

export async function createShift(data: {
  date: string
  departmentId: number
  shiftTypeId: number
  description?: string
  assignedInstructorIds?: number[]
}): Promise<Shift> {
  const response = await fetch(`${API_BASE}/shifts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to create shift: ${response.statusText}`)
  }

  const result: ApiResponse<Shift> = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Failed to create shift')
  }

  if (!result.data) {
    throw new Error('No data returned from server')
  }

  return result.data
}

export async function fetchDepartments(): Promise<Department[]> {
  const response = await fetch(`${API_BASE}/departments`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch departments: ${response.statusText}`)
  }

  const result: ApiResponse<Department[]> = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch departments')
  }

  return result.data || []
}

export async function fetchShiftTypes(): Promise<ShiftType[]> {
  const response = await fetch(`${API_BASE}/shift-types`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch shift types: ${response.statusText}`)
  }

  const result: ApiResponse<ShiftType[]> = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch shift types')
  }

  return result.data || []
}