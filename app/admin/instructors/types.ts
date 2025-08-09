import type { Instructor } from '@prisma/client'

export interface InstructorWithCertifications extends Instructor {
  certifications: {
    id: number
    name: string
    shortName: string | null
    organization: string
    department: {
      id: number
      name: string
    }
  }[]
}

export interface InstructorStats {
  total: number
  active: number
  inactive: number
  retired: number
}

export interface InstructorFormData {
  lastName: string
  firstName: string
  lastNameKana?: string
  firstNameKana?: string
  status: 'active' | 'inactive' | 'retired'
  notes?: string
  certificationIds?: number[]
}

export interface InstructorModalProps {
  isOpen: boolean
  onClose: () => void
  instructor?: InstructorWithCertifications | null
  onSave: (data: InstructorFormData) => Promise<void>
}

export interface InstructorCardProps {
  instructor: InstructorWithCertifications
  onEdit: (instructor: InstructorWithCertifications) => void
}

export type StatusFilterType = 'all' | 'active' | 'inactive' | 'retired'