export type { ShiftType } from "@prisma/client";

export type ShiftTypeStats = {
  total: number;
  active: number;
};

export type ShiftTypeFormData = {
  name: string;
  isActive: boolean;
};

export type ShiftTypeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  shiftType?: ShiftType | null;
  onSave: (data: ShiftTypeFormData) => Promise<void>;
};
