"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchShifts, fetchDepartments } from "./api";
import { Shift, Department, ShiftStats, DayData, DepartmentType } from "./types";
import { ShiftCalendarGrid } from "./ShiftCalendarGrid";
import { ShiftMobileList } from "./ShiftMobileList";
import { ShiftBottomModal } from "./ShiftBottomModal";
import { getDepartmentTypeById } from "./utils/shiftUtils";
import { HOLIDAYS } from "./constants/shiftConstants";


export default function ShiftsPage() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [_shifts, setShifts] = useState<Shift[]>([]);
  const [_departments, setDepartments] = useState<Department[]>([]);
  const [shiftStats, setShiftStats] = useState<ShiftStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データ取得
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [shiftsData, departmentsData] = await Promise.all([
          fetchShifts({
            dateFrom: `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`,
            dateTo: `${currentYear}-${String(currentMonth).padStart(2, "0")}-31`,
          }),
          fetchDepartments(),
        ]);

        setShifts(shiftsData);
        setDepartments(departmentsData);
        setShiftStats(transformShiftsToStats(shiftsData, departmentsData));
      } catch (error) {
        console.error("Failed to load data:", error);
        setError(error instanceof Error ? error.message : "データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentYear, currentMonth]);

  // シフトデータを統計データに変換
  const transformShiftsToStats = (shifts: Shift[], departments: Department[]): ShiftStats => {
    const stats: ShiftStats = {};

    shifts.forEach((shift) => {
      const date = shift.date;
      if (!stats[date]) {
        stats[date] = { shifts: [] };
      }

      const departmentType: DepartmentType = getDepartmentTypeById(
        shift.departmentId,
        departments
      );

      // 同じ部門・シフト種別の組み合わせが既に存在するかチェック
      const existingShift = stats[date].shifts.find(
        (s) => s.type === shift.shiftType.name && s.department === departmentType
      );

      if (existingShift) {
        // 既存のシフトに人数を加算
        existingShift.count += shift.assignedCount;
      } else {
        // 新しいシフトエントリを追加
        stats[date].shifts.push({
          type: shift.shiftType.name,
          department: departmentType,
          count: shift.assignedCount,
        });
      }
    });

    return stats;
  };

  // 月移動
  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDate(null);
    setIsModalOpen(false);
  };

  // 日付選択
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  // Drawerの開閉状態を管理
  const handleDrawerOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedDate(null);
    }
  };

  // 日付データを取得
  const getDayData = (date: string): DayData => {
    return {
      date,
      shifts: shiftStats[date]?.shifts || [],
      isHoliday: HOLIDAYS[date] || false,
    };
  };

  // シフト作成を開始
  const handleStartShiftCreation = () => {
    if (!selectedDate) return;

    const shiftFormData = {
      selectedDate,
      dateFormatted: new Date(selectedDate).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }),
    };

    localStorage.setItem("shiftFormData", JSON.stringify(shiftFormData));

    // TODO: 次のステップの画面に遷移（仮実装）
    alert("シフト作成画面への遷移（仮実装）");
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-lg font-medium mb-2">
            エラーが発生しました
          </div>
          <div className="text-muted-foreground text-sm">{error}</div>
          <Button onClick={() => window.location.reload()} className="mt-4">
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ページタイトル */}
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">シフト状況確認</h1>
          <p className="text-sm md:text-base text-muted-foreground px-2">
            現在のシフト状況を確認して、新しいシフトが必要な日を選択してください
          </p>
        </div>

        {/* 月間シフト状況 */}
        <div className="mb-8">
          {/* 月ナビゲーション - 固定ヘッダー */}
          <div className="sticky top-20 z-40 backdrop-blur-sm border-b border-border/30 -mx-4 px-4 mb-4">
            <div className="flex items-center justify-between py-3">
              <Button
                variant="outline"
                onClick={() => navigateMonth(-1)}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 hover:shadow-md touch-manipulation"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">前月</span>
              </Button>

              <h2 className="text-lg md:text-xl font-bold text-foreground">
                {currentYear}年{currentMonth}月
              </h2>

              <Button
                variant="outline"
                onClick={() => navigateMonth(1)}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 hover:shadow-md touch-manipulation"
              >
                <span className="hidden sm:inline text-sm font-medium">翌月</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <div className="text-muted-foreground mt-2">読み込み中...</div>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <div className="pb-8">
                {/* デスクトップ・タブレット用カレンダー */}
                <div className="hidden sm:block">
                  <ShiftCalendarGrid
                    year={currentYear}
                    month={currentMonth}
                    shiftStats={shiftStats}
                    holidays={HOLIDAYS}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                  />
                </div>

                {/* モバイル用リスト表示 */}
                <div className="block sm:hidden px-4">
                  <ShiftMobileList
                    year={currentYear}
                    month={currentMonth}
                    shiftStats={shiftStats}
                    holidays={HOLIDAYS}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                  />
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* ボトムDrawer */}
      <ShiftBottomModal
        isOpen={isModalOpen}
        onOpenChange={handleDrawerOpenChange}
        selectedDate={selectedDate}
        dayData={selectedDate ? getDayData(selectedDate) : null}
        onStartShiftCreation={handleStartShiftCreation}
      />
    </div>
  );
}
