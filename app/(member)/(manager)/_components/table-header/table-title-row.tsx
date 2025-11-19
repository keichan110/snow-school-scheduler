import type { ReactNode } from "react";

/**
 * タイトル行コンポーネントのプロパティ
 */
export type TableTitleRowProps = {
  /** テーブルのタイトル */
  title: string;
  /** 右側に配置するボタン等（オプション） */
  rightAction?: ReactNode;
  /** 追加のクラス名 */
  className?: string;
};

/**
 * テーブルヘッダーのタイトル行コンポーネント
 *
 * @remarks
 * タイトルと右側のアクション（追加ボタン等）を配置します
 *
 * @example
 * ```tsx
 * <TableTitleRow
 *   title="インストラクター一覧"
 *   rightAction={
 *     <Button onClick={handleAdd}>
 *       <Plus /> 追加
 *     </Button>
 *   }
 * />
 * ```
 */
export function TableTitleRow({
  title,
  rightAction,
  className = "",
}: TableTitleRowProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <h2 className="font-semibold text-lg">{title}</h2>
      {rightAction}
    </div>
  );
}
