'use client';

import { BaseShiftCalendar } from '@/components/shared/shift/BaseShiftCalendar';
import { ShiftStats } from '../../admin/shifts/types';

interface PublicShiftCalendarGridProps {
  year: number;
  month: number;
  shiftStats: ShiftStats;
  holidays: Record<string, boolean>;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

export function PublicShiftCalendarGrid(props: PublicShiftCalendarGridProps) {
  return <BaseShiftCalendar {...props} />;
}
