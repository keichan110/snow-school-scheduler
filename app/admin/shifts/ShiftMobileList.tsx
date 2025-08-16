'use client';

import { BaseShiftMobileList } from '@/components/shared/shift/BaseShiftMobileList';
import { ShiftStats } from './types';

interface ShiftMobileListProps {
  year: number;
  month: number;
  shiftStats: ShiftStats;
  isHoliday: (date: string) => boolean;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

export function ShiftMobileList(props: ShiftMobileListProps) {
  return <BaseShiftMobileList {...props} />;
}
