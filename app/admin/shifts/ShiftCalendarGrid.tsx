'use client';

import { BaseShiftCalendar } from '@/components/shared/shift/BaseShiftCalendar';
import { ShiftStats } from './types';

interface ShiftCalendarGridProps {
  year: number;
  month: number;
  shiftStats: ShiftStats;
  holidays: Record<string, boolean>;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

export function ShiftCalendarGrid(props: ShiftCalendarGridProps) {
  return <BaseShiftCalendar {...props} />;
}
