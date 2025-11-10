import { useSuspenseQuery } from "@tanstack/react-query";
import type { CalendarViewResponse } from "@/app/api/usecases/types/responses";
import { SHIFT_CACHE_CONFIG } from "@/lib/api/cache-config";

/**
 * カレンダービューAPI共通フェッチ関数
 *
 * @description
 * 月次・週次カレンダービューAPIに共通するデータフェッチロジックを提供します。
 *
 * @param endpoint - APIエンドポイントのパス
 * @param params - URLSearchParams
 * @returns シフトデータと統計情報
 *
 * @throws {Error} APIリクエストが失敗した場合、またはレスポンスが成功でない場合
 *
 * @example
 * ```typescript
 * const params = new URLSearchParams({ year: "2025", month: "1" });
 * const data = await fetchCalendarView("/api/usecases/shifts/monthly-view", params);
 * ```
 */
async function fetchCalendarView(
  endpoint: string,
  params: URLSearchParams
): Promise<CalendarViewResponse["data"]> {
  const response = await fetch(`${endpoint}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: CalendarViewResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Unknown API error");
  }

  return data.data;
}

/**
 * カレンダービュー用の共通フック
 *
 * @description
 * 月次・週次カレンダービューで共通するReact Query設定とフェッチロジックを提供します。
 * `useSuspenseQuery`を使用しているため、Suspenseコンポーネントとの併用が必要です。
 *
 * @template TKey - クエリキーの型
 * @param queryKey - React Queryのクエリキー
 * @param endpoint - APIエンドポイントのパス
 * @param params - URLSearchParams
 * @returns シフトデータと統計情報を含むクエリ結果
 *
 * @example
 * ```typescript
 * const { data } = useCalendarViewBase(
 *   ["monthly-view", { year: 2025, month: 1 }],
 *   "/api/usecases/shifts/monthly-view",
 *   new URLSearchParams({ year: "2025", month: "1" })
 * );
 * ```
 */
export function useCalendarViewBase<TKey extends readonly unknown[]>(
  queryKey: TKey,
  endpoint: string,
  params: URLSearchParams
) {
  return useSuspenseQuery({
    queryKey,
    queryFn: async () => fetchCalendarView(endpoint, params),
    staleTime: SHIFT_CACHE_CONFIG.STALE_TIME_MS,
    gcTime: SHIFT_CACHE_CONFIG.GC_TIME_MS,
  });
}
