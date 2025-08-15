import { useState, useCallback, useMemo } from 'react';
import { ShiftQueryParams } from '../../admin/shifts/types';
import {
  getMonday,
  getSunday,
  formatDateToString,
  getWeekPeriodDisplay,
} from '../utils/weekCalculations';

/**
 * 週間ナビゲーションのカスタムフック
 */
export function useWeekNavigation(initialDate?: Date) {
  const [weeklyBaseDate, setWeeklyBaseDate] = useState(initialDate || new Date());

  // 週間ビュー用のクエリパラメータ計算
  const weeklyQueryParams = useMemo<ShiftQueryParams>(() => {
    const monday = getMonday(weeklyBaseDate);
    const sunday = getSunday(weeklyBaseDate);

    return {
      dateFrom: formatDateToString(monday),
      dateTo: formatDateToString(sunday),
    };
  }, [weeklyBaseDate]);

  // 週の期間表示文字列
  const weekPeriod = useMemo(() => getWeekPeriodDisplay(weeklyBaseDate), [weeklyBaseDate]);

  // 年月情報
  const yearMonth = useMemo(
    () => ({
      year: weeklyBaseDate.getFullYear(),
      month: weeklyBaseDate.getMonth() + 1,
    }),
    [weeklyBaseDate]
  );

  // 週間ナビゲーションハンドラー（任意の日付ベース）
  const navigateWeek = useCallback(
    (direction: number) => {
      const newDate = new Date(weeklyBaseDate);
      newDate.setDate(weeklyBaseDate.getDate() + direction * 7);
      setWeeklyBaseDate(newDate);
    },
    [weeklyBaseDate]
  );

  // カレンダーで日付選択ハンドラー
  const handleDateSelect = useCallback((selectedDate: Date) => {
    setWeeklyBaseDate(selectedDate);
  }, []);

  return {
    weeklyBaseDate,
    setWeeklyBaseDate,
    weeklyQueryParams,
    weekPeriod,
    yearMonth,
    navigateWeek,
    handleDateSelect,
  };
}
