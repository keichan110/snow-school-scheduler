"use client";

import { QueryErrorResetBoundary, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRequireAuth } from "@/contexts/auth-context";
import { hasManagePermission } from "@/lib/auth/permissions";
import { isHoliday } from "../_lib/constants";
import {
  publicShiftsDepartmentsQueryKeys,
  publicShiftsQueryKeys,
  useDepartmentsQuery,
  usePublicShiftsQuery,
} from "../_lib/queries";
import type { DayData, ShiftQueryParams, ShiftStats } from "../_lib/types";
import { useMonthNavigation } from "../_lib/use-month-navigation";
import { useShiftDataTransformation } from "../_lib/use-shift-data-transformation";
import { useWeekNavigation } from "../_lib/use-week-navigation";
import { MonthlyCalendarWithDetails } from "./monthly-calendar-with-details";
import { PublicShiftsErrorState } from "./public-shifts-error-state";
import { PublicShiftsSuspenseFallback } from "./public-shifts-suspense-fallback";
import { ShiftMobileList } from "./shift-mobile-list";
import { UnifiedShiftBottomModal } from "./unified-shift-bottom-modal";
import { ViewToggle } from "./view-toggle";
import { WeekNavigation } from "./week-navigation";
import { WeeklyShiftList } from "./weekly-shift-list";

type ViewMode = "monthly" | "weekly";

function PublicShiftsPageContent() {
  const user = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const [pendingView, setPendingView] = useState<ViewMode | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialStep, setModalInitialStep] = useState<
    "create-step1" | "create-step2"
  >("create-step1");
  const [isPending, startTransition] = useTransition();

  const canManage = hasManagePermission(user, "shifts");

  const { currentYear, currentMonth, monthlyQueryParams, navigateMonth } =
    useMonthNavigation();
  const { weeklyBaseDate, weeklyQueryParams, navigateWeek, handleDateSelect } =
    useWeekNavigation();
  const { transformShiftsToStats } = useShiftDataTransformation();

  useEffect(() => {
    const view = searchParams.get("view") as ViewMode;
    if (view === "weekly" || view === "monthly") {
      setViewMode(view);
    }
  }, [searchParams]);

  const queryParams = useMemo<ShiftQueryParams>(
    () => (viewMode === "weekly" ? weeklyQueryParams : monthlyQueryParams),
    [viewMode, weeklyQueryParams, monthlyQueryParams]
  );

  const { data: shifts } = usePublicShiftsQuery({ params: queryParams });
  const { data: departments } = useDepartmentsQuery();

  const shiftStats = useMemo<ShiftStats>(
    () => transformShiftsToStats(shifts, departments),
    [shifts, departments, transformShiftsToStats]
  );

  const handleViewChange = useCallback(
    (newView: ViewMode) => {
      if (newView === viewMode) {
        return;
      }
      setPendingView(newView);
      startTransition(() => {
        setViewMode(newView);
        router.push(`/shifts?view=${newView}`, { scroll: false });
      });
    },
    [router, viewMode]
  );

  const handleMonthlyDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleWeeklyDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
    setModalInitialStep("create-step1");
    setIsModalOpen(true);
  }, []);

  const handleWeeklyShiftDetailSelect = useCallback((date: string) => {
    setSelectedDate(date);
    setModalInitialStep("create-step2");
    setIsModalOpen(true);
  }, []);

  const handleCreateShift = useCallback(() => {
    if (!(canManage && selectedDate)) {
      return;
    }
    setModalInitialStep("create-step1");
    setIsModalOpen(true);
  }, [canManage, selectedDate]);

  const handleShiftDetailClick = useCallback(() => {
    if (!(canManage && selectedDate)) {
      return;
    }
    setModalInitialStep("create-step2");
    setIsModalOpen(true);
  }, [canManage, selectedDate]);

  const handleModalOpenChange = useCallback((open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setModalInitialStep("create-step1");
    }
  }, []);

  const handleShiftUpdated = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: publicShiftsQueryKeys.all }),
      queryClient.invalidateQueries({
        queryKey: publicShiftsDepartmentsQueryKeys.all,
      }),
    ]);
  }, [queryClient]);

  const dayData = useMemo<DayData | null>(() => {
    if (!selectedDate) {
      return null;
    }

    const shiftsForDate = shiftStats[selectedDate]?.shifts || [];

    return {
      date: selectedDate,
      shifts: shiftsForDate,
      isHoliday: isHoliday(selectedDate),
    };
  }, [selectedDate, shiftStats]);

  useEffect(() => {
    if (!isPending) {
      setPendingView(null);
    }
  }, [isPending]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
        <div className="mb-6 text-center md:mb-8">
          <h1 className="mb-2 font-bold text-2xl text-foreground md:text-3xl">
            シフト状況確認
          </h1>
          <p className="px-2 text-muted-foreground text-sm md:text-base">
            現在のシフト状況をご確認いただけます
          </p>
        </div>

        <div className="mb-6 flex justify-center">
          <ViewToggle
            currentView={viewMode}
            isPending={isPending}
            onViewChange={handleViewChange}
            pendingView={pendingView}
          />
        </div>

        <div className="mb-8">
          {viewMode === "monthly" ? (
            <div className="-mx-4 sticky top-20 z-40 mb-4 border-border/30 border-b px-4 backdrop-blur-sm">
              <div className="flex items-center justify-between py-3">
                <Button
                  className="flex touch-manipulation items-center gap-1 px-2 py-2 hover:shadow-md md:gap-2 md:px-4"
                  onClick={() => navigateMonth(-1)}
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden font-medium text-sm sm:inline">
                    前月
                  </span>
                </Button>

                <h2 className="font-bold text-foreground text-lg md:text-xl">
                  {currentYear}年{currentMonth}月
                </h2>

                <Button
                  className="flex touch-manipulation items-center gap-1 px-2 py-2 hover:shadow-md md:gap-2 md:px-4"
                  onClick={() => navigateMonth(1)}
                  variant="outline"
                >
                  <span className="hidden font-medium text-sm sm:inline">
                    翌月
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <WeekNavigation
              baseDate={weeklyBaseDate}
              onDateSelect={handleDateSelect}
              onNavigate={navigateWeek}
            />
          )}

          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div className="pb-8">
              {viewMode === "monthly" ? (
                <>
                  <div className="hidden sm:block">
                    <MonthlyCalendarWithDetails
                      canManage={canManage}
                      isHoliday={isHoliday}
                      month={currentMonth}
                      onCreateShift={handleCreateShift}
                      onDateSelect={handleMonthlyDateSelect}
                      onShiftDetailClick={handleShiftDetailClick}
                      selectedDate={selectedDate}
                      shiftStats={shiftStats}
                      year={currentYear}
                    />
                  </div>

                  <div className="block px-4 sm:hidden">
                    <ShiftMobileList
                      isHoliday={isHoliday}
                      month={currentMonth}
                      onDateSelect={handleMonthlyDateSelect}
                      selectedDate={selectedDate}
                      shiftStats={shiftStats}
                      year={currentYear}
                    />
                  </div>
                </>
              ) : (
                <div className="px-4">
                  <WeeklyShiftList
                    baseDate={weeklyBaseDate}
                    canManage={canManage}
                    isHoliday={isHoliday}
                    onDateSelect={handleWeeklyDateSelect}
                    onShiftDetailSelect={handleWeeklyShiftDetailSelect}
                    selectedDate={selectedDate}
                    shiftStats={shiftStats}
                  />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <UnifiedShiftBottomModal
        dayData={dayData}
        initialStep={modalInitialStep}
        isOpen={isModalOpen}
        onOpenChange={handleModalOpenChange}
        onShiftUpdated={handleShiftUpdated}
        selectedDate={selectedDate}
      />
    </div>
  );
}

export default function PublicShiftsPageClient() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallbackRender={({ error, resetErrorBoundary }) => (
            <PublicShiftsErrorState
              error={error}
              onRetry={() => {
                reset();
                resetErrorBoundary();
              }}
            />
          )}
          onReset={reset}
        >
          <Suspense fallback={<PublicShiftsSuspenseFallback />}>
            <PublicShiftsPageContent />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
