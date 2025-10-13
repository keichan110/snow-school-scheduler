"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DayData } from "../types";
import { renderDepartmentSections } from "../utils/shift-components";

type ShiftDayCardProps = {
  date: Date;
  dateString: string;
  dayData: DayData;
  isSelected: boolean;
  onDateSelect: () => void;
  onShiftDetailSelect?: (shiftType: string, departmentType: string) => void;
  /** 管理権限があるかどうか */
  canManage?: boolean;
};

// 曜日インデックス定数
const SUNDAY_INDEX = 0;
const SATURDAY_INDEX = 6;

// 設計書に基づくメモ化コンポーネント
export const ShiftDayCard = React.memo<ShiftDayCardProps>(
  function ShiftDayCardComponent({
    date,
    dayData,
    isSelected,
    onDateSelect,
    onShiftDetailSelect,
    canManage = false,
  }: ShiftDayCardProps) {
    // 設計書に基づく日付情報のメモ化
    const dateInfo = useMemo(() => {
      const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
      const dayOfWeek = date.getDay();
      return {
        dayName: dayNames[dayOfWeek],
        day: date.getDate(),
        month: date.getMonth() + 1,
        isWeekend: dayOfWeek === SUNDAY_INDEX || dayOfWeek === SATURDAY_INDEX,
        isSaturday: dayOfWeek === SATURDAY_INDEX,
        isSunday: dayOfWeek === SUNDAY_INDEX,
      };
    }, [date]);

    // 祝日かどうか
    const isHoliday = dayData.isHoliday;

    // 設計書に基づくシフト統計のメモ化
    const shiftStats = useMemo(() => {
      if (!dayData.shifts || dayData.shifts.length === 0) {
        return {
          totalCount: 0,
          departments: {
            ski: [],
            snowboard: [],
            mixed: [],
          },
        };
      }

      return {
        totalCount: dayData.shifts.reduce((sum, shift) => sum + shift.count, 0),
        departments: {
          ski: dayData.shifts.filter((s) => s.department === "ski"),
          snowboard: dayData.shifts.filter((s) => s.department === "snowboard"),
          mixed: dayData.shifts.filter((s) => s.department === "mixed"),
        },
      };
    }, [dayData.shifts]);

    return (
      <Card
        className={cn("cursor-pointer transition-all duration-200", {
          "opacity-60": !dayData.shifts || dayData.shifts.length === 0,
          "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30":
            isHoliday || dateInfo.isSunday,
          "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30":
            dateInfo.isSaturday,
          "border-blue-400 bg-blue-100 shadow-lg dark:border-blue-600 dark:bg-blue-900/50":
            isSelected,
          "hover:border-gray-300 hover:shadow-md dark:hover:border-gray-600":
            !isSelected,
        })}
        onClick={onDateSelect}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            {/* 日付エリア */}
            <div className="flex items-center gap-3">
              <div
                className={cn("text-center", {
                  "text-red-600 dark:text-red-400":
                    isHoliday || dateInfo.isSunday,
                  "text-blue-600 dark:text-blue-400": dateInfo.isSaturday,
                  "text-foreground": !(
                    isHoliday ||
                    dateInfo.isSaturday ||
                    dateInfo.isSunday
                  ),
                })}
              >
                <div className="font-bold text-2xl leading-none md:text-3xl">
                  {dateInfo.day}
                </div>
                <div className="text-muted-foreground text-xs md:text-sm">
                  {dateInfo.month}月{dateInfo.dayName}
                </div>
              </div>
              {/* 祝日表示 */}
              {isHoliday && (
                <div className="rounded-full bg-red-100 px-2 py-1 font-medium text-red-600 text-xs dark:bg-red-950/30 dark:text-red-400">
                  祝日
                </div>
              )}
              {isSelected && (
                <div className="rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-600 text-xs dark:bg-blue-950/30 dark:text-blue-400">
                  選択中
                </div>
              )}
            </div>

            {/* シフト総数 */}
            {dayData.shifts && dayData.shifts.length > 0 && (
              <div className="text-right">
                <div className="text-muted-foreground text-sm">総シフト数</div>
                <div className="font-bold text-lg text-primary">
                  {shiftStats.totalCount}名
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {dayData.shifts.length === 0 ? (
              /* シフトなしの場合 */
              <div className="py-8 text-center text-muted-foreground">
                <div className="mt-1 text-sm">シフトなし</div>
                {canManage && (
                  <div className="mt-2 text-blue-600 text-xs dark:text-blue-400">
                    タップしてシフトを作成
                  </div>
                )}
              </div>
            ) : (
              /* シフトがある場合 - 統合版関数を使用 */
              <>
                {/* 部門別セクション表示（週間ビューはクリック可能） */}
                {renderDepartmentSections(
                  dayData.shifts,
                  onShiftDetailSelect
                    ? {
                        clickable: true,
                        onShiftClick: onShiftDetailSelect,
                      }
                    : undefined
                )}

                {/* 新規追加ボタン（管理権限がある場合のみ表示） */}
                {canManage && (
                  <div className="mt-4 flex justify-center">
                    <button
                      className="flex items-center gap-2 rounded-md border border-gray-300 border-dashed px-3 py-2 text-muted-foreground text-sm transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:text-blue-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDateSelect();
                      }}
                      type="button"
                    >
                      <span className="text-lg">+</span>
                      新規シフト追加
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);
