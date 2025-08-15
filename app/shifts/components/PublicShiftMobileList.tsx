'use client';

import { BaseShiftMobileList } from '@/components/shared/shift/BaseShiftMobileList';
import { ShiftStats } from '../../admin/shifts/types';

interface PublicShiftMobileListProps {
  year: number;
  month: number;
  shiftStats: ShiftStats;
  holidays: Record<string, boolean>;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

export function PublicShiftMobileList(props: PublicShiftMobileListProps) {
  return <BaseShiftMobileList {...props} />;
}
