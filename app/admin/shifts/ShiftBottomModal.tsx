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
import { DayData, DepartmentType } from "./types";
import { getDepartmentBgClass } from "./utils/shiftUtils";
import { 
  SAMPLE_INSTRUCTOR_NAMES, 
  DEPARTMENT_STYLES, 
  DEPARTMENT_NAMES 
} from "./constants/shiftConstants";

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


  const generateInstructorChips = (
    count: number,
    departmentType: DepartmentType
  ) => {
    const chipClass = DEPARTMENT_STYLES[departmentType].chipClass;

    return Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105 border",
          chipClass
        )}
      >
        <User className="w-3 h-3" weight="fill" />
        {SAMPLE_INSTRUCTOR_NAMES[i % SAMPLE_INSTRUCTOR_NAMES.length]}
      </div>
    ));
  };

  const createDepartmentSection = (
    departmentType: DepartmentType,
    shifts: typeof dayData.shifts,
    icon: React.ReactNode
  ) => {
    const departmentName = DEPARTMENT_NAMES[departmentType];
    const styles = DEPARTMENT_STYLES[departmentType];
    const { sectionBgClass: bgClass, sectionBorderClass: borderClass, sectionTextClass: textClass } = styles;

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
                {styles.label}
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
                        "px-3 py-2 rounded-lg font-medium text-sm text-foreground",
                        getDepartmentBgClass(shift.department as DepartmentType)
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
                    "ski",
                    dayData.shifts,
                    <PersonSimpleSki className={cn("w-5 h-5", DEPARTMENT_STYLES.ski.iconColor)} weight="fill" />
                  )}

                {/* スノーボード部門 */}
                {dayData.shifts.filter((s) => s.department === "snowboard").length > 0 &&
                  createDepartmentSection(
                    "snowboard",
                    dayData.shifts,
                    <PersonSimpleSnowboard className={cn("w-5 h-5", DEPARTMENT_STYLES.snowboard.iconColor)} weight="fill" />
                  )}

                {/* 共通部門 */}
                {dayData.shifts.filter((s) => s.department === "mixed").length > 0 &&
                  createDepartmentSection(
                    "mixed",
                    dayData.shifts,
                    <Calendar className={cn("w-5 h-5", DEPARTMENT_STYLES.mixed.iconColor)} weight="fill" />
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
