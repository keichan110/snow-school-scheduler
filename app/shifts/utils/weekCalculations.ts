/**
 * 週の計算に関するユーティリティ関数
 */

/**
 * 指定された日付から週の開始日（月曜日）を計算
 */
export function getMonday(date: Date): Date {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 月曜日までの日数

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
  sunday.setDate(monday.getDate() + 6);

  return sunday;
}

/**
 * 日付を YYYY-MM-DD 形式の文字列にフォーマット
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 日付を表示用の文字列にフォーマット（月/日(曜日)）
 */
export function formatDateForDisplay(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
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

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + i);
    dates.push(currentDay);
  }

  return dates;
}
