'use client';

import dynamic from 'next/dynamic';
import { ShiftCalendarSkeleton } from '@/shared/components/skeletons/ShiftCalendarSkeleton';
import { ShiftStats } from './types';

// 設計書に基づく動的インポート
const BaseShiftCalendar = dynamic(
  () =>
    import('@/components/shared/shift/BaseShiftCalendar').then((mod) => ({
      default: mod.BaseShiftCalendar,
    })),
  {
    loading: () => <ShiftCalendarSkeleton />,
    ssr: false, // カレンダーは初期レンダリング不要
  }
);

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
