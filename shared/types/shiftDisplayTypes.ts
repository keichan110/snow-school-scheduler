import type { ShiftStats } from "@/app/shifts/types";

/**
 * シフト表示コンポーネントの基本Props型
 * カレンダーグリッドとモバイルリストで共通利用
 */
export interface BaseShiftDisplayProps {
  /** 表示年 */
  year: number;
  /** 表示月 */
  month: number;
  /** シフト統計データ */
  shiftStats: ShiftStats;
  /** 祝日判定関数 */
  isHoliday: (date: string) => boolean;
  /** 選択中の日付（YYYY-MM-DD形式） */
  selectedDate: string | null;
  /** 日付選択時のコールバック */
  onDateSelect: (date: string) => void;
}

/**
 * シフトカレンダーグリッドコンポーネントのProps型
 * BaseShiftDisplayPropsを継承
 */
export interface ShiftCalendarGridProps extends BaseShiftDisplayProps {}

/**
 * シフトモバイルリストコンポーネントのProps型
 * BaseShiftDisplayPropsを継承
 */
export interface ShiftMobileListProps extends BaseShiftDisplayProps {}
