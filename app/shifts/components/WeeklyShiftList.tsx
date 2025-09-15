'use client';

import { useMemo } from 'react';
import { ShiftStats, DayData } from '../types';
import { ShiftDayCard } from './ShiftDayCard';
import { getWeekDates, formatDateToString } from '../utils/weekCalculations';

interface WeeklyShiftListProps {
  baseDate: Date;
  shiftStats: ShiftStats;
  isHoliday: (date: string) => boolean;
  selectedDate?: string | null;
  onDateSelect?: (date: string) => void;
  onShiftDetailSelect?: (date: string, shiftType: string, departmentType: string) => void;
}

export function WeeklyShiftList({
  baseDate,
  shiftStats,
  isHoliday,
  selectedDate,
  onDateSelect,
  onShiftDetailSelect,
}: WeeklyShiftListProps) {
  // 週の日付データを計算
  const weekDays = useMemo(() => {
    const weekDates = getWeekDates(baseDate);
    const days: { date: Date; dateString: string; dayData: DayData }[] = [];

    weekDates.forEach((currentDay) => {
      const dateString = formatDateToString(currentDay);

      const dayData: DayData = {
        date: dateString,
        shifts: shiftStats[dateString]?.shifts || [],
        isHoliday: isHoliday(dateString),
      };

      days.push({
        date: currentDay,
        dateString,
        dayData,
      });
    });

    return days;
  }, [baseDate, shiftStats, isHoliday]);

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
            isSelected={selectedDate === dateString}
            onDateSelect={() => onDateSelect?.(dateString)}
            onShiftDetailSelect={(shiftType, departmentType) =>
              onShiftDetailSelect?.(dateString, shiftType, departmentType)
            }
          />
        ))}
      </div>
    </div>
  );
}
