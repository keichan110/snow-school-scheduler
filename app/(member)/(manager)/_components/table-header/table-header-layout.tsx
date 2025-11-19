import type { ReactNode } from "react";

/**
 * テーブルヘッダーレイアウトコンポーネントのプロパティ
 */
export type TableHeaderLayoutProps = {
  /** タイトル行の内容 */
  titleRow: ReactNode;
  /** フィルター行の内容（オプション） */
  filterRow?: ReactNode;
  /** 追加のクラス名 */
  className?: string;
};

/**
 * テーブルヘッダーの共通レイアウトコンポーネント
 *
 * @remarks
 * instructors ページのレイアウトを基準とした統一デザイン
 * - space-y-4 による2行構造
 * - border-b による区切り線
 * - p-4 による余白
 *
 * @example
 * ```tsx
 * <TableHeaderLayout
 *   titleRow={<TableTitleRow title="インストラクター一覧" addButton={<Button>追加</Button>} />}
 *   filterRow={<TableFilterRow leftFilter={<Tabs>...</Tabs>} rightFilter={<Switch>...</Switch>} />}
 * />
 * ```
 */
export function TableHeaderLayout({
  titleRow,
  filterRow,
  className = "",
}: TableHeaderLayoutProps) {
  return (
    <div className={`space-y-4 border-b p-4 ${className}`}>
      {titleRow}
      {filterRow}
    </div>
  );
}
