'use client';

import dynamic from 'next/dynamic';
import { ShiftCalendarSkeleton } from '@/shared/components/skeletons/ShiftCalendarSkeleton';
import { ShiftCalendarGridProps } from '@/shared/types/shiftDisplayTypes';

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

export function ShiftCalendarGrid(props: ShiftCalendarGridProps) {
  return <BaseShiftCalendar {...props} />;
}
