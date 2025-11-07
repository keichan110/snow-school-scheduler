"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ShiftFormDataResponse } from "@/app/api/usecases/types/responses";

/**
 * シフト作成フォームデータのクエリキー
 *
 * @description
 * React Queryのキャッシュ管理用のキーを定義します。
 * 他のフックから無効化する際にも使用できます。
 */
export const shiftFormDataKeys = {
  all: ["shift-form-data"] as const,
  formData: () => [...shiftFormDataKeys.all] as const,
};

/**
 * シフト作成フォームの初期表示データを取得するReact Queryフック
 *
 * @description
 * `/api/usecases/shifts/form-data` エンドポイントから以下のデータを取得します：
 * - 部門一覧（アクティブのみ）
 * - シフト種別一覧
 * - 統計情報（アクティブなインストラクター数など）
 *
 * @returns {UseSuspenseQueryResult} React Query の useSuspenseQuery 結果
 * @returns {object} data - 取得したフォームデータ
 * @returns {Array} data.departments - 部門一覧
 * @returns {Array} data.shiftTypes - シフト種別一覧
 * @returns {object} data.stats - 統計情報
 * @returns {boolean} isLoading - ローディング状態
 * @returns {Error | null} error - エラーオブジェクト
 *
 * @example
 * ```tsx
 * function ShiftModal() {
 *   const { data, error } = useShiftFormData();
 *
 *   if (error) {
 *     return <div>エラーが発生しました</div>;
 *   }
 *
 *   return (
 *     <select>
 *       {data.departments.map(dept => (
 *         <option key={dept.id} value={dept.id}>
 *           {dept.name}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 *
 * @throws {Error} API呼び出しが失敗した場合、またはレスポンスが不正な場合
 *
 * @performance
 * - staleTime: 5分（マスターデータなので長めに設定）
 * - gcTime: 10分（メモリ保持時間）
 * - キャッシュにより、モーダルの再表示時はAPIリクエストなし
 *
 * @see {@link ShiftFormDataResponse} レスポンス型定義
 */
export function useShiftFormData() {
  return useSuspenseQuery({
    queryKey: shiftFormDataKeys.formData(),
    queryFn: async () => {
      // APIエンドポイントを呼び出し
      const response = await fetch("/api/usecases/shifts/form-data");

      // HTTPエラーチェック
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} ${response.statusText}`
        );
      }

      // JSONパース
      const data: ShiftFormDataResponse = await response.json();

      // APIレスポンスのsuccessフラグチェック
      if (!data.success) {
        throw new Error(data.error || "Unknown API error");
      }

      // 成功時はdataプロパティを返却
      return data.data;
    },
    // マスターデータなので5分間はキャッシュを有効とする
    // biome-ignore lint/style/noMagicNumbers: ミリ秒換算（5分）
    staleTime: 1000 * 60 * 5,
    // メモリ上に10分間保持
    // biome-ignore lint/style/noMagicNumbers: ミリ秒換算（10分）
    gcTime: 1000 * 60 * 10,
  });
}
