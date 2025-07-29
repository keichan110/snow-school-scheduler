import type { Certification, Department } from '@prisma/client'

export interface CertificationWithDepartment extends Certification {
  department: {
    id: number
    name: string
  }
}

export type DepartmentData = Department

export interface CertificationStats {
  total: number
  active: number
  ski: number
  snowboard: number
}

export interface CertificationFormData {
  name: string
  shortName: string
  department: 'ski' | 'snowboard'
  organization: string
  description: string
  status: 'active' | 'inactive'
}

export interface CertificationModalProps {
  isOpen: boolean
  onClose: () => void
  certification?: CertificationWithDepartment | null
  onSave: (data: CertificationFormData) => Promise<void>
}

export interface CertificationCardProps {
  certification: CertificationWithDepartment
  onEdit: (certification: CertificationWithDepartment) => void
}

export type FilterType = 'all' | 'ski' | 'snowboard' | 'active'