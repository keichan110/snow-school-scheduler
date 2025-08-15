'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchShifts, fetchDepartments, ApiError } from '../admin/shifts/api';
import { Shift, Department, ShiftStats, ShiftQueryParams } from '../admin/shifts/types';
import { PublicShiftCalendarGrid } from './components/PublicShiftCalendarGrid';
import { PublicShiftMobileList } from './components/PublicShiftMobileList';
import { WeeklyShiftList } from './components/WeeklyShiftList';
import { ViewToggle } from './components/ViewToggle';
import { WeekNavigation } from './components/WeekNavigation';
import { getDepartmentTypeById } from '../admin/shifts/utils/shiftUtils';
import { HOLIDAYS } from '../admin/shifts/constants/shiftConstants';

type ViewMode = 'monthly' | 'weekly';

export default function PublicShiftsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [weeklyBaseDate, setWeeklyBaseDate] = useState(now); // 週間ビューの基準日
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [, setShifts] = useState<Shift[]>([]);
  const [, setDepartments] = useState<Department[]>([]);
  const [shiftStats, setShiftStats] = useState<ShiftStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URLパラメータからビューモードを設定
  useEffect(() => {
    const view = searchParams.get('view') as ViewMode;
    if (view === 'weekly' || view === 'monthly') {
      setViewMode(view);
    }
  }, [searchParams]);

  // 週間ビュー用のクエリパラメータ計算
  const weeklyQueryParams = useMemo<ShiftQueryParams>(() => {
    // 週の開始日（月曜日）を計算
    const baseDate = new Date(weeklyBaseDate);
    const dayOfWeek = baseDate.getDay(); // 0 = Sunday, 1 = Monday, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 月曜日までの日数

    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + mondayOffset);

    // 週の終了日（日曜日）を計算
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      dateFrom: formatDate(monday),
      dateTo: formatDate(sunday),
    };
  }, [weeklyBaseDate]);

  // Memoized query parameters
  const queryParams = useMemo<ShiftQueryParams>(() => {
    if (viewMode === 'weekly') {
      return weeklyQueryParams;
    }
    return {
      dateFrom: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
      dateTo: `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`,
    };
  }, [currentYear, currentMonth, viewMode, weeklyQueryParams]);

  // Memoized data transformation
  const transformShiftsToStats = useCallback(
    (shifts: Shift[], departments: Department[]): ShiftStats => {
      const stats: ShiftStats = {};

      shifts.forEach((shift) => {
        const date = shift.date;
        if (!stats[date]) {
          stats[date] = { shifts: [] };
        }

        const departmentType = getDepartmentTypeById(shift.departmentId, departments);

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
    },
    []
  );

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

  // ビュー変更ハンドラー
  const handleViewChange = useCallback(
    (newView: ViewMode) => {
      setViewMode(newView);
      router.push(`/shifts?view=${newView}`, { scroll: false });
    },
    [router]
  );

  // 週間ナビゲーションハンドラー（任意の日付ベース）
  const navigateWeek = useCallback(
    (direction: number) => {
      const newDate = new Date(weeklyBaseDate);
      newDate.setDate(weeklyBaseDate.getDate() + direction * 7);
      setWeeklyBaseDate(newDate);
    },
    [weeklyBaseDate]
  );

  // カレンダーで日付選択ハンドラー
  const handleDateSelect = useCallback((selectedDate: Date) => {
    setWeeklyBaseDate(selectedDate);
  }, []);

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
    },
    [currentMonth, currentYear]
  );

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
            現在のシフト状況をご確認いただけます
          </p>
        </div>

        {/* ビュー切り替えボタン */}
        <div className="mb-6 flex justify-center">
          <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
        </div>

        {/* シフト状況 */}
        <div className="mb-8">
          {viewMode === 'monthly' ? (
            <>
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
            </>
          ) : (
            /* 週間ナビゲーション */
            <WeekNavigation
              baseDate={weeklyBaseDate}
              onNavigate={navigateWeek}
              onDateSelect={handleDateSelect}
            />
          )}

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
                {viewMode === 'monthly' ? (
                  <>
                    {/* デスクトップ・タブレット用カレンダー */}
                    <div className="hidden sm:block">
                      <PublicShiftCalendarGrid
                        year={currentYear}
                        month={currentMonth}
                        shiftStats={shiftStats}
                        holidays={HOLIDAYS}
                        selectedDate={null}
                        onDateSelect={() => {}}
                      />
                    </div>

                    {/* モバイル用リスト表示 */}
                    <div className="block px-4 sm:hidden">
                      <PublicShiftMobileList
                        year={currentYear}
                        month={currentMonth}
                        shiftStats={shiftStats}
                        holidays={HOLIDAYS}
                        selectedDate={null}
                        onDateSelect={() => {}}
                      />
                    </div>
                  </>
                ) : (
                  /* 週間ビュー */
                  <div className="px-4">
                    <WeeklyShiftList
                      baseDate={weeklyBaseDate}
                      shiftStats={shiftStats}
                      holidays={HOLIDAYS}
                    />
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
