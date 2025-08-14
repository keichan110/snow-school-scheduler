"use client";

import { cn } from "@/lib/utils";
import { ShiftStats, DepartmentType } from "./types";
import { PersonSimpleSki, PersonSimpleSnowboard, Calendar } from "@phosphor-icons/react";
import { 
  getShiftTypeShort, 
  getDepartmentBgClass, 
  formatDate,
  getDaysInMonth,
  getFirstDayOfWeek
} from "./utils/shiftUtils";
import { WEEKDAYS } from "./constants/shiftConstants";

interface ShiftCalendarGridProps {
  year: number;
  month: number;
  shiftStats: ShiftStats;
  holidays: Record<string, boolean>;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}


export function ShiftCalendarGrid({
  year,
  month,
  shiftStats,
  holidays,
  selectedDate,
  onDateSelect,
}: ShiftCalendarGridProps) {
  // カレンダーのセットアップ
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);




  return (
    <div className="hidden sm:block">
      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-2 md:gap-2">
        {/* 前月の空白セル */}
        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="opacity-30 pointer-events-none">
            <div className="day-card bg-background border-2 border-border rounded-xl p-3 min-h-[120px] md:min-h-[140px] shadow-lg" />
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
                "day-card cursor-pointer transition-all duration-300 border-2 rounded-xl p-3 min-h-[120px] md:min-h-[140px] flex flex-col shadow-lg",
                "hover:transform hover:-translate-y-1 hover:shadow-xl",
                {
                  "bg-background border-border hover:border-blue-400": !isSelected && !isHoliday,
                  "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800":
                    isHoliday && !isSelected,
                  "bg-blue-50 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600 transform -translate-y-1 shadow-xl":
                    isSelected,
                  "opacity-60": !hasShifts && !isHoliday,
                }
              )}
            >
              {/* 日付表示 */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={cn("text-lg font-bold", {
                    "text-red-600 dark:text-red-400": isHoliday,
                    "text-foreground": !isHoliday,
                  })}
                >
                  {day}
                </div>
                <div className="text-xs text-muted-foreground font-medium">{dayOfWeek}</div>
              </div>

              {/* シフト詳細表示 */}
              {hasShifts ? (
                <div className="flex-1 space-y-1">
                  {dayData.shifts.map((shift, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg px-2 py-2",
                        getDepartmentBgClass(shift.department as DepartmentType)
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {shift.department === "ski" && (
                          <PersonSimpleSki className="w-3 h-3 text-foreground" weight="fill" />
                        )}
                        {shift.department === "snowboard" && (
                          <PersonSimpleSnowboard
                            className="w-3 h-3 text-foreground"
                            weight="fill"
                          />
                        )}
                        {shift.department === "mixed" && (
                          <Calendar className="w-3 h-3 text-foreground" weight="fill" />
                        )}
                        <span className="text-foreground font-medium text-xs">
                          {getShiftTypeShort(shift.type)}
                        </span>
                      </div>
                      <span className="bg-background/90 px-2 py-1 rounded-full text-foreground font-bold text-xs min-w-[1.5rem] text-center shadow-sm border border-border">
                        {shift.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-xs text-muted-foreground">
                    {isHoliday ? "祝日" : "シフトなし"}
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
