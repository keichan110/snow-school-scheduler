'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DayData } from '../../admin/shifts/types';
import { renderDepartmentSections } from '../utils/shiftComponents';

interface ShiftDayCardProps {
  date: Date;
  dateString: string;
  dayData: DayData;
  isSelected: boolean;
  onDateSelect: () => void;
}

// 設計書に基づくメモ化コンポーネント
export const ShiftDayCard = React.memo<ShiftDayCardProps>(function ShiftDayCard({
  date,
  dayData,
}: ShiftDayCardProps) {
  // 設計書に基づく日付情報のメモ化
  const dateInfo = useMemo(() => {
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const dayOfWeek = date.getDay();
    return {
      dayName: dayNames[dayOfWeek],
      day: date.getDate(),
      month: date.getMonth() + 1,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isSaturday: dayOfWeek === 6,
      isSunday: dayOfWeek === 0,
    };
  }, [date]);

  // 祝日かどうか
  const isHoliday = dayData.isHoliday;

  // 設計書に基づくシフト統計のメモ化
  const shiftStats = useMemo(() => {
    if (!dayData.shifts || dayData.shifts.length === 0)
      return {
        totalCount: 0,
        departments: {
          ski: [],
          snowboard: [],
          mixed: [],
        },
      };

    return {
      totalCount: dayData.shifts.reduce((sum, shift) => sum + shift.count, 0),
      departments: {
        ski: dayData.shifts.filter((s) => s.department === 'ski'),
        snowboard: dayData.shifts.filter((s) => s.department === 'snowboard'),
        mixed: dayData.shifts.filter((s) => s.department === 'mixed'),
      },
    };
  }, [dayData.shifts]);

  return (
    <Card
      className={cn('transition-all duration-200', {
        'opacity-60': !dayData.shifts || dayData.shifts.length === 0,
        'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30':
          isHoliday || dateInfo.isSunday,
        'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30': dateInfo.isSaturday,
      })}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {/* 日付エリア */}
          <div className="flex items-center gap-3">
            <div
              className={cn('text-center', {
                'text-red-600 dark:text-red-400': isHoliday || dateInfo.isSunday,
                'text-blue-600 dark:text-blue-400': dateInfo.isSaturday,
                'text-foreground': !isHoliday && !dateInfo.isSaturday && !dateInfo.isSunday,
              })}
            >
              <div className="text-2xl font-bold leading-none md:text-3xl">{dateInfo.day}</div>
              <div className="text-xs text-muted-foreground md:text-sm">
                {dateInfo.month}月{dateInfo.dayName}
              </div>
            </div>
            {/* 祝日表示 */}
            {isHoliday && (
              <div className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
                祝日
              </div>
            )}
          </div>

          {/* シフト総数 */}
          {dayData.shifts && dayData.shifts.length > 0 && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">総シフト数</div>
              <div className="text-lg font-bold text-primary">{shiftStats.totalCount}名</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {dayData.shifts.length === 0 ? (
            /* シフトなしの場合 */
            <div className="py-8 text-center text-muted-foreground">
              <div className="mt-1 text-sm">シフトなし</div>
            </div>
          ) : (
            /* シフトがある場合 - 統合版関数を使用 */
            <>
              {/* 部門別セクション表示（統合版・表示専用） */}
              {renderDepartmentSections(dayData.shifts)}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
