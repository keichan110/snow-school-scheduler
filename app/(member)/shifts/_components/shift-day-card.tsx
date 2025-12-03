"use client";

import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { renderDepartmentSections } from "../_lib/shift-components";
import type { DayData } from "../_lib/types";
import { DepartmentSelectionPopover } from "./department-selection-popover";

type Department = {
  id: number;
  name: string;
  code: string;
};

type ShiftDayCardProps = {
  date: Date;
  dateString: string;
  dayData: DayData;
  /** 管理権限があるかどうか */
  canManage?: boolean;
  /** 部門一覧（管理権限がある場合に必要） */
  departments?: Department[];
};

// 曜日インデックス定数
const SUNDAY_INDEX = 0;
const SATURDAY_INDEX = 6;

/**
 * 1日分のシフトカードコンポーネント
 *
 * @description
 * 週次ビューで使用される1日分のシフト情報を表示するカードコンポーネント。
 * 日付情報、シフト統計、部門別のシフト詳細を表示します。
 * パフォーマンス最適化のためReact.memoを使用しています。
 *
 * @component
 */
export const ShiftDayCard = React.memo<ShiftDayCardProps>(
  function ShiftDayCardComponent({
    date,
    dateString,
    dayData,
    canManage = false,
    departments = [],
  }: ShiftDayCardProps) {
    const router = useRouter();
    const [isDepartmentPopoverOpen, setIsDepartmentPopoverOpen] =
      useState(false);

    // 部門選択後の遷移処理
    const handleDepartmentSelect = (departmentId: number) => {
      // 現在のURLパラメータを取得して returnTo に含める
      const currentUrl = window.location.pathname + window.location.search;
      const returnTo = encodeURIComponent(currentUrl);
      router.push(
        `/shifts/${dateString}?department=${departmentId}&returnTo=${returnTo}`
      );
    };

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
        },
      };
    }, [dayData.shifts]);

    return (
      <Card className="opacity-80 transition-all duration-200">
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
                {canManage && departments.length > 0 && (
                  <div className="mt-4 flex justify-center">
                    <DepartmentSelectionPopover
                      departments={departments}
                      onOpenChange={setIsDepartmentPopoverOpen}
                      onSelectDepartment={handleDepartmentSelect}
                      open={isDepartmentPopoverOpen}
                    >
                      <button
                        className="flex items-center gap-2 rounded-md border border-gray-300 border-dashed px-3 py-2 text-muted-foreground text-sm transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:text-blue-400"
                        onClick={() => setIsDepartmentPopoverOpen(true)}
                        type="button"
                      >
                        <span className="text-lg">+</span>
                        シフト編集
                      </button>
                    </DepartmentSelectionPopover>
                  </div>
                )}
              </div>
            ) : (
              /* シフトがある場合 - 統合版関数を使用 */
              <>
                {/* 部門別セクション表示（週間ビューはクリック可能） */}
                {renderDepartmentSections(dayData.shifts, {
                  clickable: canManage,
                  dateString,
                })}

                {/* 新規追加ボタン（管理権限がある場合のみ表示） */}
                {canManage && departments.length > 0 && (
                  <div className="mt-4 flex justify-center">
                    <DepartmentSelectionPopover
                      departments={departments}
                      onOpenChange={setIsDepartmentPopoverOpen}
                      onSelectDepartment={handleDepartmentSelect}
                      open={isDepartmentPopoverOpen}
                    >
                      <button
                        className="flex items-center gap-2 rounded-md border border-gray-300 border-dashed px-3 py-2 text-muted-foreground text-sm transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:text-blue-400"
                        onClick={() => setIsDepartmentPopoverOpen(true)}
                        type="button"
                      >
                        <span className="text-lg">+</span>
                        シフト編集
                      </button>
                    </DepartmentSelectionPopover>
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
