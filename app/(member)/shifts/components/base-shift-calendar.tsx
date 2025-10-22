"use client";

import { DepartmentIcon } from "@/app/(member)/shifts/_components/department-icon";
import { ShiftBadge } from "@/app/(member)/shifts/_components/shift-badge";
import { cn } from "@/lib/utils";
import type { BaseShiftDisplayProps, DepartmentType } from "./types";
import {
  formatDate,
  getDaysInMonth,
  getDepartmentBgClass,
  getFirstDayOfWeek,
  getShiftTypeShort,
  WEEKDAYS,
} from "./utils";

const SATURDAY_DAY_INDEX = 6;

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
        {Array.from({ length: firstDayOfWeek }, (_, i) => {
          // 空白セルに一意なキーを生成（月の前の日付として負の値を使用）
          const emptyKey = `${year}-${month}-empty-${i - firstDayOfWeek}`;
          return (
            <div className="pointer-events-none opacity-30" key={emptyKey}>
              <div className="day-card min-h-[120px] rounded-xl border-2 border-border bg-background p-3 shadow-lg md:min-h-[140px]" />
            </div>
          );
        })}

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
          const isSaturday = dayOfWeekIndex === SATURDAY_DAY_INDEX;
          const isSunday = dayOfWeekIndex === 0;

          return (
            <button
              className={cn(
                "day-card flex min-h-[120px] cursor-pointer flex-col rounded-xl border-2 p-3 shadow-lg transition-all duration-300 md:min-h-[140px]",
                "hover:-translate-y-1 hover:transform hover:shadow-xl",
                {
                  "border-border bg-background hover:border-blue-400": !(
                    isSelected ||
                    isHolidayDay ||
                    isSaturday ||
                    isSunday
                  ),
                  "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30":
                    isSaturday && !isSelected,
                  "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30":
                    (isHolidayDay || isSunday) && !isSelected,
                  "-translate-y-1 transform border-blue-400 bg-blue-50 shadow-xl dark:border-blue-600 dark:bg-blue-950/30":
                    isSelected,
                  "opacity-60": !(
                    hasShifts ||
                    isHolidayDay ||
                    isSaturday ||
                    isSunday
                  ),
                }
              )}
              key={day}
              onClick={() => onDateSelect(date)}
              type="button"
            >
              {/* 日付表示 */}
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={cn("font-bold text-lg", {
                    "text-red-600 dark:text-red-400": isHolidayDay || isSunday,
                    "text-blue-600 dark:text-blue-400": isSaturday,
                    "text-foreground": !(
                      isHolidayDay ||
                      isSaturday ||
                      isSunday
                    ),
                  })}
                >
                  {day}
                </div>
                <div className="font-medium text-muted-foreground text-xs">
                  {dayOfWeek}
                </div>
                {isHolidayDay && (
                  <div className="rounded-full bg-red-100 px-2 py-1 font-medium text-red-600 text-xs dark:bg-red-950/30 dark:text-red-400">
                    祝日
                  </div>
                )}
              </div>

              {/* シフト詳細表示 */}
              <div className="flex flex-1 items-center justify-center">
                {hasShifts ? (
                  <div className="w-full space-y-1">
                    {dayData.shifts.map((shift) => (
                      <div
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-lg px-2 py-2",
                          getDepartmentBgClass(
                            shift.department as DepartmentType
                          )
                        )}
                        key={`${date}-${shift.department}-${shift.type}`}
                      >
                        <div className="flex items-center gap-2">
                          <DepartmentIcon
                            department={shift.department}
                            size="sm"
                          />
                          <span className="font-medium text-foreground text-xs">
                            {getShiftTypeShort(shift.type)}
                          </span>
                        </div>
                        <ShiftBadge count={shift.count} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground text-xs">
                    シフトなし
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
