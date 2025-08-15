'use client';

import { useMemo } from 'react';
import { ShiftStats, DayData } from '../../admin/shifts/types';
import { ShiftDayCard } from './ShiftDayCard';

interface WeeklyShiftListProps {
  baseDate: Date;
  shiftStats: ShiftStats;
  holidays: Record<string, boolean>;
}

export function WeeklyShiftList({ baseDate, shiftStats, holidays }: WeeklyShiftListProps) {
  // 週の開始日と終了日を計算
  const weekDays = useMemo(() => {
    // 週の開始日（月曜日）を計算
    const dayOfWeek = baseDate.getDay(); // 0 = Sunday, 1 = Monday, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 月曜日までの日数

    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + mondayOffset);

    const days: { date: Date; dateString: string; dayData: DayData | null }[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(monday);
      currentDay.setDate(monday.getDate() + i);

      const dateString = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;

      const dayData: DayData | null = shiftStats[dateString]
        ? {
            date: dateString,
            shifts: shiftStats[dateString].shifts,
            isHoliday: holidays[dateString] || false,
          }
        : null;

      days.push({
        date: currentDay,
        dateString,
        dayData,
      });
    }

    return days;
  }, [baseDate, shiftStats, holidays]);

  // 週の期間を表示用にフォーマット
  const weekPeriod = useMemo(() => {
    if (weekDays.length === 0) return '';
    const start = weekDays[0]?.date;
    const end = weekDays[6]?.date;

    if (!start || !end) return '';

    const formatDate = (date: Date) => {
      const m = date.getMonth() + 1;
      const d = date.getDate();
      const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
      const dayName = dayNames[date.getDay()];
      return `${m}/${d}(${dayName})`;
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  }, [weekDays]);

  // 年月情報を取得
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth() + 1;

  return (
    <div className="space-y-6">
      {/* 日別カードリスト */}
      <div className="space-y-4">
        {weekDays.map(({ date, dateString, dayData }) => (
          <ShiftDayCard
            key={dateString}
            date={date}
            dateString={dateString}
            dayData={dayData}
            isSelected={false}
            onDateSelect={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
