'use client';

import { useMemo } from 'react';
import { ShiftStats, DayData } from '../../admin/shifts/types';
import { ShiftDayCard } from './ShiftDayCard';
import { getWeekDates, formatDateToString } from '../utils/weekCalculations';

interface WeeklyShiftListProps {
  baseDate: Date;
  shiftStats: ShiftStats;
  holidays: Record<string, boolean>;
}

export function WeeklyShiftList({ baseDate, shiftStats, holidays }: WeeklyShiftListProps) {
  // 週の日付データを計算
  const weekDays = useMemo(() => {
    const weekDates = getWeekDates(baseDate);
    const days: { date: Date; dateString: string; dayData: DayData | null }[] = [];

    weekDates.forEach((currentDay) => {
      const dateString = formatDateToString(currentDay);

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
    });

    return days;
  }, [baseDate, shiftStats, holidays]);

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
