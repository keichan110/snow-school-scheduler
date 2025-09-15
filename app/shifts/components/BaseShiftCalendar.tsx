'use client';

import { cn } from '@/lib/utils';
import { BaseShiftDisplayProps, DepartmentType } from './types';
import { DepartmentIcon } from '@/components/shared/ui/DepartmentIcon';
import { ShiftBadge } from '@/components/shared/ui/ShiftBadge';
import {
  getShiftTypeShort,
  getDepartmentBgClass,
  formatDate,
  getDaysInMonth,
  getFirstDayOfWeek,
  WEEKDAYS,
} from './utils';

export function BaseShiftCalendar({
  year,
  month,
  shiftStats,
  isHoliday: checkIsHoliday,
  selectedDate,
  onDateSelect,
}: BaseShiftDisplayProps) {
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
          const isHolidayDay = checkIsHoliday(date);
          const isSelected = selectedDate === date;
          const hasShifts = dayData && dayData.shifts.length > 0;
          const dayOfWeekIndex = new Date(year, month - 1, day).getDay();
          const dayOfWeek = WEEKDAYS[dayOfWeekIndex];
          const isSaturday = dayOfWeekIndex === 6;
          const isSunday = dayOfWeekIndex === 0;

          return (
            <div
              key={day}
              onClick={() => onDateSelect(date)}
              className={cn(
                'day-card flex min-h-[120px] cursor-pointer flex-col rounded-xl border-2 p-3 shadow-lg transition-all duration-300 md:min-h-[140px]',
                'hover:-translate-y-1 hover:transform hover:shadow-xl',
                {
                  'border-border bg-background hover:border-blue-400':
                    !isSelected && !isHolidayDay && !isSaturday && !isSunday,
                  'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30':
                    isSaturday && !isSelected,
                  'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30':
                    (isHolidayDay || isSunday) && !isSelected,
                  '-translate-y-1 transform border-blue-400 bg-blue-50 shadow-xl dark:border-blue-600 dark:bg-blue-950/30':
                    isSelected,
                  'opacity-60': !hasShifts && !isHolidayDay && !isSaturday && !isSunday,
                }
              )}
            >
              {/* 日付表示 */}
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={cn('text-lg font-bold', {
                    'text-red-600 dark:text-red-400': isHolidayDay || isSunday,
                    'text-blue-600 dark:text-blue-400': isSaturday,
                    'text-foreground': !isHolidayDay && !isSaturday && !isSunday,
                  })}
                >
                  {day}
                </div>
                <div className="text-xs font-medium text-muted-foreground">{dayOfWeek}</div>
                {isHolidayDay && (
                  <div className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
                    祝日
                  </div>
                )}
              </div>

              {/* シフト詳細表示 */}
              <div className="flex flex-1 items-center justify-center">
                {hasShifts ? (
                  <div className="w-full space-y-1">
                    {dayData.shifts.map((shift, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'flex items-center justify-between gap-2 rounded-lg px-2 py-2',
                          getDepartmentBgClass(shift.department as DepartmentType)
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <DepartmentIcon department={shift.department} size="sm" />
                          <span className="text-xs font-medium text-foreground">
                            {getShiftTypeShort(shift.type)}
                          </span>
                        </div>
                        <ShiftBadge count={shift.count} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-xs text-muted-foreground">シフトなし</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
