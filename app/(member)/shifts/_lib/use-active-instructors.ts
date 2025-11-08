"use client";
import { useQuery } from "@tanstack/react-query";
import type { ActiveInstructorsByDepartmentResponse } from "@/app/api/usecases/types/responses";

/**
 * 部門別アクティブインストラクターのクエリキー
 *
 * @description
 * React Queryのキャッシュ管理用のキーを定義します。
 * 他のフックから無効化する際にも使用できます。
 */
export const activeInstructorsKeys = {
  all: ["active-instructors"] as const,
  byDepartment: (departmentId: number | null) =>
    [...activeInstructorsKeys.all, departmentId] as const,
};

/**
 * 部門別アクティブインストラクターを取得するReact Queryフック
 *
 * @description
 * `/api/usecases/instructors/active-by-department/:departmentId` エンドポイントから以下のデータを取得します：
 * - インストラクター一覧（アクティブのみ、サーバー側でフォーマット済み）
 * - 部門メタデータ（部門ID、部門名、インストラクター数）
 *
 * @param departmentId - 部門ID（nullの場合はクエリを実行しない）
 * @returns {UseQueryResult} React Query の useQuery 結果
 * @returns {object | null} data - 取得したインストラクターデータ（departmentIdがnullの場合はnull）
 * @returns {Array} data.instructors - インストラクター一覧
 * @returns {object} data.metadata - 部門メタデータ
 * @returns {boolean} isLoading - ローディング状態
 * @returns {Error | null} error - エラーオブジェクト
 *
 * @example
 * ```tsx
 * function InstructorSelector({ departmentId }: { departmentId: number | null }) {
 *   const { data, isLoading, error } = useActiveInstructorsByDepartment(departmentId);
 *
 *   if (!departmentId) {
 *     return <div>部門を選択してください</div>;
 *   }
 *
 *   if (isLoading) {
 *     return <div>読み込み中...</div>;
 *   }
 *
 *   if (error) {
 *     return <div>エラーが発生しました: {error.message}</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h3>{data.metadata.departmentName} ({data.metadata.activeCount}人)</h3>
 *       <ul>
 *         {data.instructors.map(instructor => (
 *           <li key={instructor.id}>
 *             {instructor.displayName} - {instructor.certificationSummary}
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 *
 * @throws {Error} API呼び出しが失敗した場合、またはレスポンスが不正な場合
 * @throws {Error} 部門が見つからない場合（404エラー）
 *
 * @performance
 * - enabled: departmentId !== null（部門未選択時はクエリを無効化）
 * - staleTime: 3分（インストラクター情報は比較的変更される可能性があるため）
 * - gcTime: 5分（メモリ保持時間）
 * - データ転送量を大幅に削減（サーバー側でフォーマット済みデータを返却）
 * - サーバー側でフルネーム結合・資格要約を実行
 *
 * @see {@link ActiveInstructorsByDepartmentResponse} レスポンス型定義
 */
export function useActiveInstructorsByDepartment(departmentId: number | null) {
  return useQuery({
    queryKey: activeInstructorsKeys.byDepartment(departmentId),
    queryFn: async () => {
      // departmentIdがnullの場合はクエリを実行しない（enabled: falseで制御）
      if (!departmentId) {
        return null;
      }

      // APIエンドポイントを呼び出し
      const response = await fetch(
        `/api/usecases/instructors/active-by-department/${departmentId}`
      );

      // HTTPエラーチェック
      if (!response.ok) {
        // 404エラーの場合は専用のエラーメッセージ
        const STATUS_NOT_FOUND = 404;
        if (response.status === STATUS_NOT_FOUND) {
          throw new Error("部門が見つかりません");
        }
        throw new Error(
          `HTTP error! status: ${response.status} ${response.statusText}`
        );
      }

      // JSONパース
      const data: ActiveInstructorsByDepartmentResponse = await response.json();

      // APIレスポンスのsuccessフラグチェック
      if (!data.success) {
        throw new Error(data.error || "Unknown API error");
      }

      // 成功時はdataプロパティを返却
      return data.data;
    },
    // departmentIdがnullの場合はクエリを無効化
    enabled: departmentId !== null,
    // インストラクター情報は比較的変更される可能性があるため3分間キャッシュ
    // biome-ignore lint/style/noMagicNumbers: ミリ秒換算（3分）
    staleTime: 1000 * 60 * 3,
    // メモリ上に5分間保持
    // biome-ignore lint/style/noMagicNumbers: ミリ秒換算（5分）
    gcTime: 1000 * 60 * 5,
  });
}
