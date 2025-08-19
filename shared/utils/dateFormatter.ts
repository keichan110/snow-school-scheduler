/**
 * 日付フォーマット関連のユーティリティ関数
 * スキー・スノーボードスクールシフト管理システム用
 */

export interface DateFormatOptions {
  includeWeekday?: boolean;
  format?: 'long' | 'short' | 'numeric';
}

/**
 * 日付を日本語形式でフォーマットする共通関数
 * @param dateString - フォーマットする日付文字列
 * @param options - フォーマットオプション
 * @returns フォーマットされた日付文字列
 */
export function formatDateForDisplay(dateString: string, options: DateFormatOptions = {}): string {
  const { includeWeekday = true, format = 'long' } = options;

  try {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: format,
      day: 'numeric',
    });

    if (includeWeekday) {
      const weekdayStr = date.toLocaleDateString('ja-JP', {
        weekday: 'short',
      });
      return `${dateStr}（${weekdayStr}）`;
    }

    return dateStr;
  } catch {
    return dateString;
  }
}
