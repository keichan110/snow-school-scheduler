'use client';

import React, { useMemo } from 'react';
import { Calendar, PersonSimpleSki, PersonSimpleSnowboard } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DayData } from '../../admin/shifts/types';
import { DEPARTMENT_STYLES } from '../../admin/shifts/constants/shiftConstants';
import { createDepartmentSection } from '../utils/shiftComponents';

interface ShiftDayCardProps {
  date: Date;
  dateString: string;
  dayData: DayData | null;
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
    return {
      dayName: dayNames[date.getDay()],
      day: date.getDate(),
      month: date.getMonth() + 1,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    };
  }, [date]);

  // 祝日かどうか
  const isHoliday = dayData?.isHoliday || false;

  // 設計書に基づくシフト統計のメモ化
  const shiftStats = useMemo(() => {
    if (!dayData?.shifts)
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
  }, [dayData?.shifts]);

  return (
    <Card
      className={`transition-all duration-200 ${dayData ? '' : 'opacity-60'} ${isHoliday ? 'border-red-200 bg-red-50' : ''} ${dateInfo.isWeekend && !isHoliday ? 'border-blue-200 bg-blue-50' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {/* 日付エリア */}
          <div className="flex items-center gap-3">
            <div
              className={`text-center ${isHoliday ? 'text-red-700' : dateInfo.isWeekend ? 'text-blue-700' : 'text-foreground'}`}
            >
              <div className="text-2xl font-bold leading-none md:text-3xl">{dateInfo.day}</div>
              <div className="text-xs text-muted-foreground md:text-sm">
                {dateInfo.month}月{dateInfo.dayName}
              </div>
            </div>
            {/* 祝日表示 */}
            {isHoliday && (
              <div className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                祝日
              </div>
            )}
          </div>

          {/* シフト総数 */}
          {dayData && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">総シフト数</div>
              <div className="text-lg font-bold text-primary">{shiftStats.totalCount}名</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {dayData ? (
          <div className="space-y-4">
            {dayData.shifts.length === 0 ? (
              /* シフトなしの場合 */
              <div className="py-8 text-center text-muted-foreground">
                <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <div className="text-lg font-medium">シフトが設定されていません</div>
                <div className="mt-1 text-sm">この日はシフトの設定がありません</div>
              </div>
            ) : (
              /* シフトがある場合 - PublicShiftBottomModalと同じロジック */
              <>
                {/* スキー部門 */}
                {shiftStats.departments.ski.length > 0 &&
                  createDepartmentSection(
                    'ski',
                    dayData.shifts,
                    <PersonSimpleSki
                      className={cn('h-5 w-5', DEPARTMENT_STYLES.ski.iconColor)}
                      weight="fill"
                    />
                  )}

                {/* スノーボード部門 */}
                {shiftStats.departments.snowboard.length > 0 &&
                  createDepartmentSection(
                    'snowboard',
                    dayData.shifts,
                    <PersonSimpleSnowboard
                      className={cn('h-5 w-5', DEPARTMENT_STYLES.snowboard.iconColor)}
                      weight="fill"
                    />
                  )}

                {/* 共通部門 */}
                {shiftStats.departments.mixed.length > 0 &&
                  createDepartmentSection(
                    'mixed',
                    dayData.shifts,
                    <Calendar
                      className={cn('h-5 w-5', DEPARTMENT_STYLES.mixed.iconColor)}
                      weight="fill"
                    />
                  )}
              </>
            )}
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">シフトなし</div>
        )}
      </CardContent>
    </Card>
  );
});
