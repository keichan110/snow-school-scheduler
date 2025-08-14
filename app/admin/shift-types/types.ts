import type { ShiftType } from '@prisma/client';

export interface ShiftTypeStats {
  total: number;
  active: number;
}

export interface ShiftTypeFormData {
  name: string;
  isActive: boolean;
}

export interface ShiftTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftType?: ShiftType | null;
  onSave: (data: ShiftTypeFormData) => Promise<void>;
}

export type { ShiftType };
