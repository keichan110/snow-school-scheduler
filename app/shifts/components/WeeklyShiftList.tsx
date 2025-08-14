'use client';

import { useMemo } from 'react';
import { ShiftStats, DayData } from '../../admin/shifts/types';
import { ShiftDayCard } from './ShiftDayCard';

interface WeeklyShiftListProps {
  year: number;
  month: number;
  week: number; // 週番号 (1-5)
  shiftStats: ShiftStats;
  holidays: Record<string, boolean>;
}

export function WeeklyShiftList({ year, month, week, shiftStats, holidays }: WeeklyShiftListProps) {
  // 週の開始日と終了日を計算
  const weekDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ...

    // その月の第1週の月曜日を基準とする
    const firstMonday = new Date(firstDayOfMonth);
    const daysToFirstMonday = firstDayOfWeek === 0 ? 1 : 8 - firstDayOfWeek;
    firstMonday.setDate(firstMonday.getDate() + daysToFirstMonday);

    // 指定された週の開始日を計算
    const weekStart = new Date(firstMonday);
    weekStart.setDate(weekStart.getDate() + (week - 1) * 7);

    const days: { date: Date; dateString: string; dayData: DayData | null }[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(weekStart);
      currentDay.setDate(weekStart.getDate() + i);

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
  }, [year, month, week, shiftStats, holidays]);

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

  return (
    <div className="space-y-6">
      {/* 週間ヘッダー */}
      <div className="text-center">
        <h2 className="text-lg font-bold text-foreground md:text-xl">
          {year}年{month}月 第{week}週
        </h2>
        <p className="text-sm text-muted-foreground">{weekPeriod}</p>
      </div>

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
