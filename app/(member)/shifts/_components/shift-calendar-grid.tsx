"use client";

import dynamic from "next/dynamic";
import { ShiftCalendarSkeleton } from "./shift-calendar-skeleton";
import type { BaseShiftDisplayProps } from "./types";

/**
 * 統合シフトカレンダーグリッドコンポーネントのProps型
 */
interface UnifiedShiftCalendarGridProps extends BaseShiftDisplayProps {
  /** 表示バリアント（将来の拡張用） */
  variant?: "admin" | "public";
}

// BaseShiftCalendarの動的インポート
// 管理者用・公開用で共通の実装を使用
const BaseShiftCalendar = dynamic(
  () =>
    import("./base-shift-calendar").then((mod) => ({
      default: mod.BaseShiftCalendar,
    })),
  {
    loading: () => <ShiftCalendarSkeleton />,
    ssr: false, // カレンダーは初期レンダリング不要
  }
);

/**
 * 統合シフトカレンダーグリッドコンポーネント
 *
 * 管理者用・公開用のカレンダーグリッド表示を統合したコンポーネント。
 * 重複していたコンポーネントを統合し、保守性を向上させる。
 *
 * @param props - シフト表示に必要なプロパティ
 * @returns JSX.Element
 */
export function ShiftCalendarGrid(props: UnifiedShiftCalendarGridProps) {
  // variantは将来の拡張用（現在は使用せず、BaseShiftCalendarに直接委譲）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _variant, ...baseProps } = props;

  return <BaseShiftCalendar {...baseProps} />;
}

// 型エクスポート（後方互換性のため）
export type { UnifiedShiftCalendarGridProps };
