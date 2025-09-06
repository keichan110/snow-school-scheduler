'use client';

import { cn } from '@/lib/utils';
import { getDepartmentType } from '@/app/certifications/utils';

export interface CertificationBadgeProps {
  /**
   * 資格の短縮名（表示されるテキスト）
   */
  shortName: string;
  /**
   * 部門名（色分けの判定に使用）
   * TODO: 将来的にはdepartmentCodeを受け取るように変更する
   */
  departmentName: string;
  /**
   * 追加のCSSクラス
   */
  className?: string;
}

/**
 * 資格バッジコンポーネント
 *
 * 部門に応じて色分けされた資格バッジを表示します。
 * - スキー部門: 青系統
 * - スノーボード部門: オレンジ系統
 *
 * TODO: departmentCodeベースに変更して判定ロジックを簡略化する
 *
 * @example
 * ```tsx
 * <CertificationBadge
 *   shortName="指導員"
 *   departmentName="スキー部門"
 * />
 * ```
 */
export function CertificationBadge({
  shortName,
  departmentName,
  className,
}: CertificationBadgeProps) {
  const deptType = getDepartmentType(departmentName);
  const badgeClass = deptType === 'ski' ? 'badge-ski' : 'badge-snowboard';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-1 text-xs font-medium',
        badgeClass,
        className
      )}
    >
      {shortName}
    </span>
  );
}
