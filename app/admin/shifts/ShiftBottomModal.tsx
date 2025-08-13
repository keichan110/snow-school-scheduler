"use client";

import { ArrowRight } from "lucide-react";
import { PersonSimpleSki, PersonSimpleSnowboard, Calendar, User } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { DayData } from "./types";

interface ShiftBottomModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string | null;
  dayData: DayData | null;
  onStartShiftCreation: () => void;
}

export function ShiftBottomModal({
  isOpen,
  onOpenChange,
  selectedDate,
  dayData,
  onStartShiftCreation,
}: ShiftBottomModalProps) {
  if (!selectedDate || !dayData) return null;

  const formatSelectedDate = () => {
    try {
      const date = new Date(selectedDate);
      const dateStr = date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const weekdayStr = date.toLocaleDateString("ja-JP", {
        weekday: "short",
      });
      return `${dateStr}（${weekdayStr}）`;
    } catch {
      return selectedDate;
    }
  };

  const getShiftBadgeClass = (type: string, department: string): string => {
    // カレンダーグリッドと同じ背景色を使用
    switch (department) {
      case "ski":
        return "bg-ski-200 text-gray-900";
      case "snowboard":
        return "bg-snowboard-200 text-gray-900";
      case "mixed":
        return "bg-gray-300 text-gray-900";
      default:
        return "bg-gray-300 text-gray-900";
    }
  };

  const generateInstructorChips = (
    count: number,
    departmentType: "ski" | "snowboard" | "mixed"
  ) => {
    const instructorNames = [
      "田中太郎",
      "佐藤花子",
      "鈴木次郎",
      "高橋美咲",
      "木村健太",
      "中村優子",
      "山田一郎",
      "伊藤智子",
      "小林直美",
      "渡辺大介",
    ];

    let chipClass = "bg-muted text-muted-foreground hover:bg-muted/80";
    if (departmentType === "ski") {
      chipClass =
        "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900";
    } else if (departmentType === "snowboard") {
      chipClass =
        "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900";
    }

    return Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105 border",
          chipClass
        )}
      >
        <User className="w-3 h-3" weight="fill" />
        {instructorNames[i % instructorNames.length]}
      </div>
    ));
  };

  const createDepartmentSection = (
    departmentName: string,
    departmentType: "ski" | "snowboard" | "mixed",
    shifts: typeof dayData.shifts,
    icon: React.ReactNode
  ) => {
    let bgClass = "bg-card";
    let borderClass = "border-border";
    let textClass = "text-foreground";

    if (departmentType === "ski") {
      bgClass = "bg-ski-50/50 dark:bg-ski-950/20";
      borderClass = "border-ski-200 dark:border-ski-800";
      textClass = "text-ski-900 dark:text-ski-100";
    } else if (departmentType === "snowboard") {
      bgClass = "bg-snowboard-50/50 dark:bg-snowboard-950/20";
      borderClass = "border-snowboard-200 dark:border-snowboard-800";
      textClass = "text-snowboard-900 dark:text-snowboard-100";
    }

    return (
      <div
        key={departmentType}
        className={cn(
          "rounded-xl p-3 md:p-4 border transition-all duration-300",
          bgClass,
          borderClass
        )}
      >
        <div className="md:flex md:items-start md:gap-4">
          {/* 部門ヘッダー */}
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-0 md:w-40 md:flex-shrink-0">
            {icon}
            <div>
              <h4 className={cn("font-semibold text-base md:text-lg", textClass)}>
                {departmentName}
              </h4>
              <p className="text-xs text-muted-foreground">
                {departmentName === "スキー"
                  ? "Ski"
                  : departmentName === "スノーボード"
                  ? "Snowboard"
                  : "Common"}
              </p>
            </div>
          </div>

          {/* シフト種類とインストラクター */}
          <div className="flex-1 space-y-3">
            {shifts
              .filter((s) => s.department === departmentType)
              .map((shift, idx) => (
                <div
                  key={idx}
                  className="bg-background rounded-lg p-3 border border-border hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <div
                      className={cn(
                        "px-3 py-2 rounded-lg font-medium text-sm",
                        getShiftBadgeClass(shift.type, shift.department)
                      )}
                    >
                      {shift.type}
                    </div>
                    <div className="text-xs text-muted-foreground">{shift.count}名配置</div>
                  </div>
                  <div className="space-y-1 md:space-y-0 md:flex md:flex-wrap md:gap-2">
                    {generateInstructorChips(shift.count, departmentType)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="text-center pb-2">
          <DrawerTitle className="flex items-center justify-center gap-2 text-xl md:text-2xl">
            {formatSelectedDate()}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto">
          {/* シフト詳細エリア */}
          <div className="space-y-4">
            {dayData.shifts.length === 0 ? (
              /* シフトなしの場合 */
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium">シフトが設定されていません</div>
                <div className="text-sm mt-1">新しいシフトを作成できます</div>
              </div>
            ) : (
              /* シフトがある場合 */
              <>
                {/* スキー部門 */}
                {dayData.shifts.filter((s) => s.department === "ski").length > 0 &&
                  createDepartmentSection(
                    "スキー",
                    "ski",
                    dayData.shifts,
                    <PersonSimpleSki className="w-5 h-5 text-ski-600" weight="fill" />
                  )}

                {/* スノーボード部門 */}
                {dayData.shifts.filter((s) => s.department === "snowboard").length > 0 &&
                  createDepartmentSection(
                    "スノーボード",
                    "snowboard",
                    dayData.shifts,
                    <PersonSimpleSnowboard className="w-5 h-5 text-snowboard-600" weight="fill" />
                  )}

                {/* 共通部門 */}
                {dayData.shifts.filter((s) => s.department === "mixed").length > 0 &&
                  createDepartmentSection(
                    "共通",
                    "mixed",
                    dayData.shifts,
                    <Calendar className="w-5 h-5 text-muted-foreground" weight="fill" />
                  )}
              </>
            )}
          </div>
        </div>

        <DrawerFooter>
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <DrawerClose asChild>
              <Button variant="outline" size="lg" className="md:flex-1">
                閉じる
              </Button>
            </DrawerClose>
            <Button onClick={onStartShiftCreation} className="md:flex-1 gap-2" size="lg">
              選択した日でシフト作成を開始
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
