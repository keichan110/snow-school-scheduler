import { Department, ShiftSummary } from '../types'

// 部門タイプの定義
export type DepartmentType = 'ski' | 'snowboard' | 'mixed'

// シフト種別の短縮名マッピング
const SHIFT_TYPE_SHORT_MAP: Record<string, string> = {
  スキーレッスン: 'レッスン',
  スノーボードレッスン: 'レッスン',
  スキー検定: '検定',
  スノーボード検定: '検定',
  県連事業: '県連',
  月末イベント: 'イベント',
} as const

// 部門背景クラスのマッピング
const DEPARTMENT_BG_CLASS_MAP: Record<DepartmentType, string> = {
  ski: 'bg-ski-200 dark:bg-ski-800',
  snowboard: 'bg-snowboard-200 dark:bg-snowboard-800',
  mixed: 'bg-gray-200 dark:bg-gray-800',
} as const

/**
 * シフト種別名を短縮形に変換
 */
export function getShiftTypeShort(type: string): string {
  return SHIFT_TYPE_SHORT_MAP[type] || type
}

/**
 * 部門タイプに応じた背景クラスを取得
 */
export function getDepartmentBgClass(department: DepartmentType): string {
  return DEPARTMENT_BG_CLASS_MAP[department]
}

/**
 * 日付文字列をフォーマット（YYYY-MM-DD形式）
 */
export function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * 部門名から部門タイプを判定
 */
export function determineDepartmentType(departmentName: string): DepartmentType {
  if (departmentName.includes('スキー')) {
    return 'ski'
  } else if (departmentName.includes('スノーボード')) {
    return 'snowboard'
  }
  return 'mixed'
}

/**
 * 部門IDから部門タイプを判定
 */
export function getDepartmentTypeById(
  departmentId: number,
  departments: Department[]
): DepartmentType {
  const department = departments.find((d) => d.id === departmentId)
  if (!department) return 'mixed'
  return determineDepartmentType(department.name)
}

/**
 * 日付文字列から曜日を取得
 */
export function getWeekdayFromDate(dateString: string): string {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const date = new Date(dateString)
  return weekdays[date.getDay()] || '?'
}

/**
 * 月の日数を取得
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * 月の最初の曜日（0=日曜日）を取得
 */
export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay()
}