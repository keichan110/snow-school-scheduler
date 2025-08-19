'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchShifts, fetchDepartments, ApiError } from './api';
import { Shift, Department, ShiftStats, DayData, ShiftQueryParams } from './types';
import { ShiftCalendarGrid } from '@/components/shared/shift/ShiftCalendarGrid';
import { ShiftMobileList } from './ShiftMobileList';
import { ShiftBottomModal } from './ShiftBottomModal';
import { isHoliday } from './constants/shiftConstants';
import { useShiftDataTransformation } from '../../shifts/hooks/useShiftDataTransformation';

export default function ShiftsPage() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setShifts] = useState<Shift[]>([]);
  const [, setDepartments] = useState<Department[]>([]);
  const [shiftStats, setShiftStats] = useState<ShiftStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized query parameters
  const queryParams = useMemo<ShiftQueryParams>(
    () => ({
      dateFrom: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
      dateTo: `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`,
    }),
    [currentYear, currentMonth]
  );

  // カスタムフックを使用
  const { transformShiftsToStats } = useShiftDataTransformation();

  // データ取得
  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [shiftsData, departmentsData] = await Promise.all([
          fetchShifts(queryParams),
          fetchDepartments(),
        ]);

        if (!isCancelled) {
          setShifts(shiftsData);
          setDepartments(departmentsData);
          setShiftStats(transformShiftsToStats(shiftsData, departmentsData));
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load data:', error);
          const errorMessage =
            error instanceof ApiError
              ? error.message
              : error instanceof Error
                ? error.message
                : 'データの読み込みに失敗しました';
          setError(errorMessage);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [queryParams, transformShiftsToStats]);

  // Memoized month navigation
  const navigateMonth = useCallback(
    (direction: number) => {
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
    },
    [currentMonth, currentYear]
  );

  // Memoized date selection
  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  }, []);

  // Memoized drawer state management
  const handleDrawerOpenChange = useCallback((open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedDate(null);
    }
  }, []);

  // Memoized day data retrieval
  const getDayData = useCallback(
    (date: string): DayData => {
      return {
        date,
        shifts: shiftStats[date]?.shifts || [],
        isHoliday: isHoliday(date),
      };
    },
    [shiftStats]
  );

  // Memoized shift creation handler
  const handleStartShiftCreation = useCallback(() => {
    if (!selectedDate) return;

    const shiftFormData = {
      selectedDate,
      dateFormatted: new Date(selectedDate).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }),
    };

    try {
      localStorage.setItem('shiftFormData', JSON.stringify(shiftFormData));
      // TODO: 次のステップの画面に遷移（仮実装）
      alert('シフト作成画面への遷移（仮実装）');
    } catch (error) {
      console.error('Failed to save shift form data:', error);
      alert('データの保存に失敗しました');
    }
  }, [selectedDate]);

  // シフトデータを再読み込み（カレンダー全体 + 特定日対応）
  const handleShiftUpdated = useCallback(async () => {
    try {
      const [shiftsData, departmentsData] = await Promise.all([
        fetchShifts(queryParams),
        fetchDepartments(),
      ]);

      setShifts(shiftsData);
      setDepartments(departmentsData);
      setShiftStats(transformShiftsToStats(shiftsData, departmentsData));
    } catch (error) {
      console.error('Failed to refresh shift data:', error);
      throw error; // モーダル側でエラーハンドリングできるように
    }
  }, [queryParams, transformShiftsToStats]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-lg font-medium text-red-600 dark:text-red-400">
            エラーが発生しました
          </div>
          <div className="text-sm text-muted-foreground">{error}</div>
          <Button onClick={() => window.location.reload()} className="mt-4" type="button">
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
        {/* ページタイトル */}
        <div className="mb-6 text-center md:mb-8">
          <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">シフト状況確認</h1>
          <p className="px-2 text-sm text-muted-foreground md:text-base">
            現在のシフト状況を確認して、新しいシフトが必要な日を選択してください
          </p>
        </div>

        {/* 月間シフト状況 */}
        <div className="mb-8">
          {/* 月ナビゲーション - 固定ヘッダー */}
          <div className="sticky top-20 z-40 -mx-4 mb-4 border-b border-border/30 px-4 backdrop-blur-sm">
            <div className="flex items-center justify-between py-3">
              <Button
                variant="outline"
                onClick={() => navigateMonth(-1)}
                className="flex touch-manipulation items-center gap-1 px-2 py-2 hover:shadow-md md:gap-2 md:px-4"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden text-sm font-medium sm:inline">前月</span>
              </Button>

              <h2 className="text-lg font-bold text-foreground md:text-xl">
                {currentYear}年{currentMonth}月
              </h2>

              <Button
                variant="outline"
                onClick={() => navigateMonth(1)}
                className="flex touch-manipulation items-center gap-1 px-2 py-2 hover:shadow-md md:gap-2 md:px-4"
              >
                <span className="hidden text-sm font-medium sm:inline">翌月</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <div className="mt-2 text-muted-foreground">読み込み中...</div>
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
                    isHoliday={isHoliday}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                  />
                </div>

                {/* モバイル用リスト表示 */}
                <div className="block px-4 sm:hidden">
                  <ShiftMobileList
                    year={currentYear}
                    month={currentMonth}
                    shiftStats={shiftStats}
                    isHoliday={isHoliday}
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
        onShiftUpdated={handleShiftUpdated}
      />
    </div>
  );
}
