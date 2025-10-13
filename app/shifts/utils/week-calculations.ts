/**
 * 週の計算に関するユーティリティ関数
 */

// 週の日数
const DAYS_IN_WEEK = 7;

// 日曜日から月曜日までの逆方向のオフセット
const SUNDAY_TO_MONDAY_OFFSET = -6;

// 月曜日から日曜日までのオフセット
const MONDAY_TO_SUNDAY_OFFSET = 6;

/**
 * 指定された日付から週の開始日（月曜日）を計算
 */
export function getMonday(date: Date): Date {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ...
  const mondayOffset =
    dayOfWeek === 0 ? SUNDAY_TO_MONDAY_OFFSET : 1 - dayOfWeek; // 月曜日までの日数

  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);

  return monday;
}

/**
 * 指定された日付から週の終了日（日曜日）を計算
 */
export function getSunday(baseDate: Date): Date {
  const monday = getMonday(baseDate);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + MONDAY_TO_SUNDAY_OFFSET);

  return sunday;
}

/**
 * 日付を YYYY-MM-DD 形式の文字列にフォーマット
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 日付を表示用の文字列にフォーマット（月/日(曜日)）
 */
export function formatDateForDisplay(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
  const dayName = dayNames[date.getDay()];
  return `${m}/${d}(${dayName})`;
}

/**
 * 週の期間を表示用文字列で取得（月/日(曜日) - 月/日(曜日)）
 */
export function getWeekPeriodDisplay(baseDate: Date): string {
  const monday = getMonday(baseDate);
  const sunday = getSunday(baseDate);

  return `${formatDateForDisplay(monday)} - ${formatDateForDisplay(sunday)}`;
}

/**
 * 指定された基準日から週の日付配列を生成（月曜日から日曜日）
 */
export function getWeekDates(baseDate: Date): Date[] {
  const monday = getMonday(baseDate);
  const dates: Date[] = [];

  for (let i = 0; i < DAYS_IN_WEEK; i++) {
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + i);
    dates.push(currentDay);
  }

  return dates;
}
