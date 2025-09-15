import { useState, useCallback, useMemo } from 'react';
import { ShiftQueryParams } from '../types';

/**
 * 月間ナビゲーションのカスタムフック
 */
export function useMonthNavigation(initialYear?: number, initialMonth?: number) {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(initialYear || now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialMonth || now.getMonth() + 1);

  // 月間ビュー用のクエリパラメータ計算
  const monthlyQueryParams = useMemo<ShiftQueryParams>(() => {
    return {
      dateFrom: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
      dateTo: `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`,
    };
  }, [currentYear, currentMonth]);

  // 月ナビゲーションハンドラー
  const navigateMonth = useCallback(
    (direction: number) => {
      let newMonth = currentMonth + direction;
      let newYear = currentYear;

      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }

      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
    },
    [currentMonth, currentYear]
  );

  return {
    currentYear,
    currentMonth,
    setCurrentYear,
    setCurrentMonth,
    monthlyQueryParams,
    navigateMonth,
  };
}
