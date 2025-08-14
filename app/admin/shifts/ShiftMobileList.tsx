'use client';

import { cn } from '@/lib/utils';
import { ShiftStats, DepartmentType } from './types';
import { PersonSimpleSki, PersonSimpleSnowboard, Calendar } from '@phosphor-icons/react';
import {
  getShiftTypeShort,
  getDepartmentBgClass,
  formatDate,
  getDaysInMonth,
} from './utils/shiftUtils';
import { WEEKDAYS } from './constants/shiftConstants';

interface ShiftMobileListProps {
  year: number;
  month: number;
  shiftStats: ShiftStats;
  holidays: Record<string, boolean>;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

export function ShiftMobileList({
  year,
  month,
  shiftStats,
  holidays,
  selectedDate,
  onDateSelect,
}: ShiftMobileListProps) {
  const daysInMonth = getDaysInMonth(year, month);

  return (
    <div className="block space-y-3 sm:hidden">
      {Array.from({ length: daysInMonth }).map((_, index) => {
        const day = index + 1;
        const date = formatDate(year, month, day);
        const dayData = shiftStats[date];
        const isHoliday = holidays[date] || false;
        const isSelected = selectedDate === date;
        const hasShifts = dayData && dayData.shifts.length > 0;
        const dayOfWeek = WEEKDAYS[new Date(year, month - 1, day).getDay()];

        return (
          <div
            key={day}
            onClick={() => onDateSelect(date)}
            className={cn(
              'mobile-day-item cursor-pointer rounded-xl border p-4 transition-all duration-300',
              'hover:-translate-y-0.5 hover:transform hover:shadow-md',
              {
                'border-border bg-background hover:border-blue-400': !isSelected && !isHoliday,
                'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30':
                  isHoliday && !isSelected,
                '-translate-y-0.5 transform border-blue-400 bg-blue-50 shadow-md dark:border-blue-600 dark:bg-blue-950/30':
                  isSelected,
                'opacity-60': !hasShifts && !isHoliday,
              }
            )}
          >
            {/* 日付ヘッダー */}
            <div className="mb-3 flex items-center gap-3">
              <div
                className={cn('text-2xl font-bold', {
                  'text-red-600 dark:text-red-400': isHoliday,
                  'text-foreground': !isHoliday,
                })}
              >
                {day}
              </div>
              <div className="text-sm text-muted-foreground">{dayOfWeek}</div>
            </div>

            {/* シフト詳細 */}
            {hasShifts ? (
              <div className="space-y-2">
                {dayData.shifts.map((shift, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-lg px-3 py-2',
                      getDepartmentBgClass(shift.department as DepartmentType)
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {shift.department === 'ski' && (
                        <PersonSimpleSki className="h-4 w-4 text-foreground" weight="fill" />
                      )}
                      {shift.department === 'snowboard' && (
                        <PersonSimpleSnowboard className="h-4 w-4 text-foreground" weight="fill" />
                      )}
                      {shift.department === 'mixed' && (
                        <Calendar className="h-4 w-4 text-foreground" weight="fill" />
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {getShiftTypeShort(shift.type)}
                      </span>
                    </div>
                    <span className="min-w-[1.5rem] rounded-full border border-border bg-background/90 px-2 py-1 text-center text-xs font-bold text-foreground shadow-sm">
                      {shift.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-2 text-center text-sm text-muted-foreground">
                {isHoliday ? '祝日' : 'シフトなし'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
