'use client';

import { cn } from '@/lib/utils';
import { ShiftStats, DepartmentType } from '../../admin/shifts/types';
import { PersonSimpleSki, PersonSimpleSnowboard, Calendar } from '@phosphor-icons/react';
import {
  getShiftTypeShort,
  getDepartmentBgClass,
  formatDate,
  getDaysInMonth,
  getFirstDayOfWeek,
} from '../../admin/shifts/utils/shiftUtils';
import { WEEKDAYS } from '../../admin/shifts/constants/shiftConstants';

interface PublicShiftCalendarGridProps {
  year: number;
  month: number;
  shiftStats: ShiftStats;
  holidays: Record<string, boolean>;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

export function PublicShiftCalendarGrid({
  year,
  month,
  shiftStats,
  holidays,
  selectedDate,
  onDateSelect,
}: PublicShiftCalendarGridProps) {
  // カレンダーのセットアップ
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  return (
    <div className="hidden sm:block">
      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-2 md:gap-2">
        {/* 前月の空白セル */}
        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="pointer-events-none opacity-30">
            <div className="day-card min-h-[120px] rounded-xl border-2 border-border bg-background p-3 shadow-lg md:min-h-[140px]" />
          </div>
        ))}

        {/* 現在の月の日付 */}
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
                'day-card flex min-h-[120px] cursor-pointer flex-col rounded-xl border-2 p-3 shadow-lg transition-all duration-300 md:min-h-[140px]',
                'hover:-translate-y-1 hover:transform hover:shadow-xl',
                {
                  'border-border bg-background hover:border-blue-400': !isSelected && !isHoliday,
                  'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30':
                    isHoliday && !isSelected,
                  '-translate-y-1 transform border-blue-400 bg-blue-50 shadow-xl dark:border-blue-600 dark:bg-blue-950/30':
                    isSelected,
                  'opacity-60': !hasShifts && !isHoliday,
                }
              )}
            >
              {/* 日付表示 */}
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={cn('text-lg font-bold', {
                    'text-red-600 dark:text-red-400': isHoliday,
                    'text-foreground': !isHoliday,
                  })}
                >
                  {day}
                </div>
                <div className="text-xs font-medium text-muted-foreground">{dayOfWeek}</div>
              </div>

              {/* シフト詳細表示 */}
              {hasShifts ? (
                <div className="flex-1 space-y-1">
                  {dayData.shifts.map((shift, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-lg px-2 py-2',
                        getDepartmentBgClass(shift.department as DepartmentType)
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {shift.department === 'ski' && (
                          <PersonSimpleSki className="h-3 w-3 text-foreground" weight="fill" />
                        )}
                        {shift.department === 'snowboard' && (
                          <PersonSimpleSnowboard
                            className="h-3 w-3 text-foreground"
                            weight="fill"
                          />
                        )}
                        {shift.department === 'mixed' && (
                          <Calendar className="h-3 w-3 text-foreground" weight="fill" />
                        )}
                        <span className="text-xs font-medium text-foreground">
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
                <div className="flex flex-1 items-center justify-center">
                  <div className="text-center text-xs text-muted-foreground">
                    {isHoliday ? '祝日' : 'シフトなし'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
