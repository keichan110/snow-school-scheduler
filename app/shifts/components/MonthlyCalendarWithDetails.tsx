"use client";

import React, { useMemo } from "react";
import { DepartmentIcon } from "@/components/shared/ui/DepartmentIcon";
import { ShiftBadge } from "@/components/shared/ui/ShiftBadge";
import { cn } from "@/lib/utils";
import type { DayData } from "../types";
import { ShiftDayCard } from "./ShiftDayCard";
import type { BaseShiftDisplayProps, DepartmentType } from "./types";
import {
  formatDate,
  getDaysInMonth,
  getDepartmentBgClass,
  getFirstDayOfWeek,
  getShiftTypeShort,
  WEEKDAYS,
} from "./utils";

interface MonthlyCalendarWithDetailsProps extends BaseShiftDisplayProps {
  /** 管理権限があるかどうか */
  canManage?: boolean;
  /** シフト詳細クリック時のハンドラー */
  onShiftDetailClick?: () => void;
  /** 新規シフト作成ハンドラー */
  onCreateShift?: () => void;
}

export function MonthlyCalendarWithDetails({
  year,
  month,
  shiftStats,
  isHoliday: checkIsHoliday,
  selectedDate,
  onDateSelect,
  canManage = false,
  onShiftDetailClick,
  onCreateShift,
}: MonthlyCalendarWithDetailsProps) {
  // カレンダーのセットアップ
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  // 選択された日付の週と位置を計算
  const selectedDateInfo = useMemo(() => {
    if (!selectedDate) return null;

    const selectedDay = Number.parseInt(selectedDate.split("-")[2] || "1");
    const selectedDayIndex = selectedDay - 1;
    const totalCellIndex = firstDayOfWeek + selectedDayIndex;
    const weekIndex = Math.floor(totalCellIndex / 7);
    const dayInWeek = totalCellIndex % 7;

    return {
      weekIndex,
      dayInWeek,
      selectedDay,
      dayData: shiftStats[selectedDate] || {
        shifts: [],
        date: selectedDate,
        isHoliday: checkIsHoliday(selectedDate),
      },
    };
  }, [selectedDate, firstDayOfWeek, shiftStats, checkIsHoliday]);

  // 週ごとにセルを分割
  const weeks = useMemo(() => {
    const totalCells = firstDayOfWeek + daysInMonth;
    const weeksCount = Math.ceil(totalCells / 7);
    const weeks: Array<Array<{ day: number | null; date: string | null }>> = [];

    for (let week = 0; week < weeksCount; week++) {
      const weekCells: Array<{ day: number | null; date: string | null }> = [];

      for (let dayInWeek = 0; dayInWeek < 7; dayInWeek++) {
        const cellIndex = week * 7 + dayInWeek;

        if (
          cellIndex < firstDayOfWeek ||
          cellIndex >= firstDayOfWeek + daysInMonth
        ) {
          // 空のセル
          weekCells.push({ day: null, date: null });
        } else {
          // 実際の日付
          const day = cellIndex - firstDayOfWeek + 1;
          const date = formatDate(year, month, day);
          weekCells.push({ day, date });
        }
      }

      weeks.push(weekCells);
    }

    return weeks;
  }, [year, month, firstDayOfWeek, daysInMonth]);

  const renderCalendarCell = (
    cellData: { day: number | null; date: string | null },
    cellIndex: number
  ) => {
    if (!(cellData.day && cellData.date)) {
      // 空のセル
      return (
        <div
          className="pointer-events-none opacity-30"
          key={`empty-${cellIndex}`}
        >
          <div className="day-card min-h-[120px] rounded-xl border-2 border-border bg-background p-3 shadow-lg md:min-h-[140px]" />
        </div>
      );
    }

    const { day, date } = cellData;
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
      >
        {/* 日付表示 */}
        <div className="mb-2 flex items-center gap-2">
          <div
            className={cn("font-bold text-lg", {
              "text-red-600 dark:text-red-400": isHolidayDay || isSunday,
              "text-blue-600 dark:text-blue-400": isSaturday,
              "text-foreground": !(isHolidayDay || isSaturday || isSunday),
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
              {dayData.shifts.map((shift, idx) => (
                <div
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg px-2 py-2",
                    getDepartmentBgClass(shift.department as DepartmentType)
                  )}
                  key={idx}
                >
                  <div className="flex items-center gap-2">
                    <DepartmentIcon department={shift.department} size="sm" />
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
      </div>
    );
  };

  return (
    <div className="hidden sm:block">
      <div className="space-y-4">
        {weeks.map((week, weekIndex) => (
          <div className="space-y-4" key={weekIndex}>
            {/* 週の行 */}
            <div className="grid grid-cols-7 gap-2 md:gap-2">
              {week.map((cellData, cellIndexInWeek) =>
                renderCalendarCell(cellData, weekIndex * 7 + cellIndexInWeek)
              )}
            </div>

            {/* 選択された日付の詳細表示（該当する週の下に表示） */}
            {selectedDateInfo && selectedDateInfo.weekIndex === weekIndex && (
              <div className="slide-in-from-top-2 animate-in duration-300">
                <div className="mx-auto max-w-4xl">
                  <ShiftDayCard
                    date={new Date(selectedDate!)}
                    dateString={selectedDate!}
                    dayData={selectedDateInfo.dayData as DayData}
                    isSelected={true}
                    onDateSelect={() => {
                      if (canManage && onCreateShift) {
                        onCreateShift();
                      }
                    }}
                    {...(canManage && onShiftDetailClick
                      ? {
                          onShiftDetailSelect: () => {
                            onShiftDetailClick();
                          },
                        }
                      : {})}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
