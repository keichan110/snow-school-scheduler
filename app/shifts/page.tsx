'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchShifts, fetchDepartments, ApiError } from './api';
import { Shift, Department, ShiftStats, ShiftQueryParams, DayData } from './types';
import { ShiftCalendarGrid } from './components/ShiftCalendarGrid';
import { ShiftMobileList } from './components/ShiftMobileList';
import { UnifiedShiftBottomModal } from './components/UnifiedShiftBottomModal';
import { WeeklyShiftList } from './components/WeeklyShiftList';
import { ViewToggle } from './components/ViewToggle';
import { WeekNavigation } from './components/WeekNavigation';
import { isHoliday } from './constants/shiftConstants';
import { useWeekNavigation } from './hooks/useWeekNavigation';
import { useMonthNavigation } from './hooks/useMonthNavigation';
import { useShiftDataTransformation } from './hooks/useShiftDataTransformation';

type ViewMode = 'monthly' | 'weekly';

function PublicShiftsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [, setShifts] = useState<Shift[]>([]);
  const [, setDepartments] = useState<Department[]>([]);
  const [shiftStats, setShiftStats] = useState<ShiftStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialStep, setModalInitialStep] = useState<
    'view' | 'create-step1' | 'create-step2'
  >('view');

  // カスタムフックを使用
  const { currentYear, currentMonth, monthlyQueryParams, navigateMonth } = useMonthNavigation();
  const { weeklyBaseDate, weeklyQueryParams, navigateWeek, handleDateSelect } = useWeekNavigation();
  const { transformShiftsToStats } = useShiftDataTransformation();

  // URLパラメータからビューモードを設定
  useEffect(() => {
    const view = searchParams.get('view') as ViewMode;
    if (view === 'weekly' || view === 'monthly') {
      setViewMode(view);
    }
  }, [searchParams]);

  // Memoized query parameters
  const queryParams = useMemo<ShiftQueryParams>(() => {
    if (viewMode === 'weekly') {
      return weeklyQueryParams;
    }
    return monthlyQueryParams;
  }, [viewMode, weeklyQueryParams, monthlyQueryParams]);

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

  // 日付選択ハンドラー（月間ビュー用）
  const handleMonthlyDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
    setModalInitialStep('view');
    setIsModalOpen(true);
  }, []);

  // 週間ビュー専用：空の日付または新規追加ボタンクリック時
  const handleWeeklyDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
    setModalInitialStep('create-step1');
    setIsModalOpen(true);
    // 週間ビューでは直接シフト作成画面（create-step1）へ
  }, []);

  // 週間ビュー専用：既存シフト詳細クリック時（インストラクター選択画面へ直行）
  const handleWeeklyShiftDetailSelect = useCallback(
    (date: string, _shiftType: string, _departmentType: string) => {
      setSelectedDate(date);
      setModalInitialStep('create-step2');
      setIsModalOpen(true);
      // 週間ビューでは直接インストラクター選択画面（create-step2）へ
      // TODO: 将来的には shiftType と departmentType を使用して事前設定可能
    },
    []
  );

  // モーダル開閉ハンドラー
  const handleModalOpenChange = useCallback((open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedDate(null);
      setModalInitialStep('view');
    }
  }, []);

  // シフトデータを再読み込み（管理機能用）
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
      throw error;
    }
  }, [queryParams, transformShiftsToStats]);

  // dayData計算
  const dayData = useMemo((): DayData | null => {
    if (!selectedDate) {
      return null;
    }

    // シフトが設定されていない日付でも dayData を作成
    const shiftsForDate = shiftStats[selectedDate]?.shifts || [];

    return {
      date: selectedDate,
      shifts: shiftsForDate,
      isHoliday: isHoliday(selectedDate),
    };
  }, [selectedDate, shiftStats]);

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
                      <ShiftCalendarGrid
                        year={currentYear}
                        month={currentMonth}
                        shiftStats={shiftStats}
                        isHoliday={isHoliday}
                        selectedDate={selectedDate}
                        onDateSelect={handleMonthlyDateSelect}
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
                        onDateSelect={handleMonthlyDateSelect}
                      />
                    </div>
                  </>
                ) : (
                  /* 週間ビュー */
                  <div className="px-4">
                    <WeeklyShiftList
                      baseDate={weeklyBaseDate}
                      shiftStats={shiftStats}
                      isHoliday={isHoliday}
                      selectedDate={selectedDate}
                      onDateSelect={handleWeeklyDateSelect}
                      onShiftDetailSelect={handleWeeklyShiftDetailSelect}
                    />
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* 統合モーダル（権限ベース） */}
      <UnifiedShiftBottomModal
        isOpen={isModalOpen}
        onOpenChange={handleModalOpenChange}
        selectedDate={selectedDate}
        dayData={dayData}
        onShiftUpdated={handleShiftUpdated}
        initialStep={modalInitialStep}
      />
    </div>
  );
}

export default function PublicShiftsPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <div className="mt-2 text-muted-foreground">読み込み中...</div>
            </div>
          </div>
        }
      >
        <PublicShiftsPageContent />
      </Suspense>
    </ProtectedRoute>
  );
}
