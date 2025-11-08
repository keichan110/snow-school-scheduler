import { useCalendarViewBase } from "./use-calendar-view-base";

/**
 * 月次カレンダービュー用のクエリキー
 *
 * @description
 * React Queryのキャッシュ管理に使用するクエリキーを定義します。
 * 年月ごとに異なるキャッシュを持つことで、効率的なデータ管理を実現します。
 */
export const monthlyViewKeys = {
  /**
   * すべての月次ビュークエリの基本キー
   */
  all: ["monthly-view"] as const,

  /**
   * 特定の年月の月次ビュークエリキー
   *
   * @param year - 年
   * @param month - 月 (1-12)
   * @returns クエリキー
   */
  byYearMonth: (year: number, month: number) =>
    [...monthlyViewKeys.all, { year, month }] as const,
};

/**
 * 月次カレンダービュー用のシフトデータを取得するReact Queryフック
 *
 * @description
 * 指定された年月の1ヶ月分のシフトデータを取得します。
 * `useSuspenseQuery`を使用しているため、Suspenseコンポーネントとの併用が必要です。
 *
 * キャッシュ戦略:
 * - staleTime: 2分 - データが新鮮とみなされる期間
 * - gcTime: 5分 - キャッシュがメモリに保持される期間
 *
 * @param year - 取得する年 (例: 2025)
 * @param month - 取得する月 (1-12)
 * @returns シフトデータと統計情報を含むクエリ結果
 *
 * @throws {Error} APIリクエストが失敗した場合、またはレスポンスが成功でない場合
 *
 * @example
 * ```tsx
 * function MonthlyCalendar() {
 *   const { data } = useMonthlyView(2025, 1);
 *
 *   return (
 *     <div>
 *       <h2>Total Shifts: {data.summary.totalShifts}</h2>
 *       {data.shifts.map(shift => (
 *         <ShiftCard key={shift.id} shift={shift} />
 *       ))}
 *     </div>
 *   );
 * }
 *
 * // Suspenseで囲む
 * <Suspense fallback={<Loading />}>
 *   <MonthlyCalendar />
 * </Suspense>
 * ```
 */
export function useMonthlyView(year: number, month: number) {
  const params = new URLSearchParams({
    year: year.toString(),
    month: month.toString(),
  });

  return useCalendarViewBase(
    monthlyViewKeys.byYearMonth(year, month),
    "/api/usecases/shifts/monthly-view",
    params
  );
}
