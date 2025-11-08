import { useCalendarViewBase } from "./use-calendar-view-base";

/**
 * 週次カレンダービュー用のクエリキー
 *
 * @description
 * React Queryのキャッシュ管理に使用するクエリキーを定義します。
 * 開始日ごとに異なるキャッシュを持つことで、効率的なデータ管理を実現します。
 */
export const weeklyViewKeys = {
  /**
   * すべての週次ビュークエリの基本キー
   */
  all: ["weekly-view"] as const,

  /**
   * 特定の開始日の週次ビュークエリキー
   *
   * @param dateFrom - 週の開始日 (YYYY-MM-DD形式)
   * @returns クエリキー
   */
  byDateFrom: (dateFrom: string) =>
    [...weeklyViewKeys.all, { dateFrom }] as const,
};

/**
 * 週次カレンダービュー用のシフトデータを取得するReact Queryフック
 *
 * @description
 * 指定された開始日から1週間分（7日分）のシフトデータを取得します。
 * `useSuspenseQuery`を使用しているため、Suspenseコンポーネントとの併用が必要です。
 *
 * キャッシュ戦略:
 * - staleTime: 2分 - データが新鮮とみなされる期間
 * - gcTime: 5分 - キャッシュがメモリに保持される期間
 *
 * @param dateFrom - 週の開始日 (YYYY-MM-DD形式、例: "2025-01-13")
 * @returns シフトデータと統計情報を含むクエリ結果
 *
 * @throws {Error} APIリクエストが失敗した場合、またはレスポンスが成功でない場合
 *
 * @example
 * ```tsx
 * function WeeklyCalendar() {
 *   const { data } = useWeeklyView("2025-01-13");
 *
 *   return (
 *     <div>
 *       <h2>Total Shifts: {data.summary.totalShifts}</h2>
 *       <p>Week: {data.summary.dateRange.from} - {data.summary.dateRange.to}</p>
 *       {data.shifts.map(shift => (
 *         <ShiftCard key={shift.id} shift={shift} />
 *       ))}
 *     </div>
 *   );
 * }
 *
 * // Suspenseで囲む
 * <Suspense fallback={<Loading />}>
 *   <WeeklyCalendar />
 * </Suspense>
 * ```
 */
export function useWeeklyView(dateFrom: string) {
  const params = new URLSearchParams({
    dateFrom,
  });

  return useCalendarViewBase(
    weeklyViewKeys.byDateFrom(dateFrom),
    "/api/usecases/shifts/weekly-view",
    params
  );
}
