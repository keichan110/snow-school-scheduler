'use client';

import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DayData } from '../types';
import { renderDepartmentSections } from '../utils/shiftComponents';
import type { DepartmentSectionOptions } from '../utils/shiftComponents';

interface ShiftDetailSectionProps {
  /** 選択された日付 */
  selectedDate: string | null;
  /** 日付のシフトデータ */
  dayData: DayData | null;
  /** シフト詳細クリック時のオプション（管理機能用） */
  shiftOptions?: DepartmentSectionOptions;
  /** 新規作成ハンドラー（管理機能用） */
  onCreateShift?: () => void;
  /** セクションのクラス名 */
  className?: string;
}

/**
 * シフト詳細表示セクションコンポーネント
 *
 * カレンダーの下段に表示するシフト詳細領域。
 * 月間・週間ビューで統一した表示を提供する。
 */
export function ShiftDetailSection({
  selectedDate,
  dayData,
  shiftOptions,
  onCreateShift,
  className,
}: ShiftDetailSectionProps) {
  // 日付情報をメモ化
  const dateInfo = useMemo(() => {
    if (!selectedDate || !dayData) return null;

    const date = new Date(selectedDate);
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const dayOfWeek = date.getDay();

    return {
      date,
      dayName: dayNames[dayOfWeek],
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isSunday: dayOfWeek === 0,
      isSaturday: dayOfWeek === 6,
    };
  }, [selectedDate, dayData]);

  // シフト統計をメモ化
  const shiftStats = useMemo(() => {
    if (!dayData?.shifts || dayData.shifts.length === 0) {
      return { totalCount: 0, isEmpty: true };
    }

    return {
      totalCount: dayData.shifts.reduce((sum, shift) => sum + shift.count, 0),
      isEmpty: false,
    };
  }, [dayData?.shifts]);

  // 選択された日付がない場合の表示
  if (!selectedDate || !dayData || !dateInfo) {
    return (
      <Card className={cn('w-full border-dashed', className)}>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <div className="text-lg font-medium">日付を選択してください</div>
          <div className="mt-1 text-sm">シフトの詳細が表示されます</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        {/* ヘッダー: 選択した日付情報 */}
        <div className="mb-6 border-b border-border pb-4">
          <div className="flex items-center gap-4">
            <div
              className={cn('text-center', {
                'text-red-600 dark:text-red-400': dayData.isHoliday || dateInfo.isSunday,
                'text-blue-600 dark:text-blue-400': dateInfo.isSaturday,
                'text-foreground': !dayData.isHoliday && !dateInfo.isSaturday && !dateInfo.isSunday,
              })}
            >
              <div className="text-3xl font-bold leading-none md:text-4xl">{dateInfo.day}</div>
              <div className="text-sm text-muted-foreground">
                {dateInfo.year}年{dateInfo.month}月{dateInfo.dayName}曜日
              </div>
            </div>

            {/* 祝日表示 */}
            {dayData.isHoliday && (
              <div className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
                祝日
              </div>
            )}

            {/* シフト総数 */}
            <div className="ml-auto text-right">
              <div className="text-sm text-muted-foreground">配置予定</div>
              <div className="text-2xl font-bold text-primary">{shiftStats.totalCount}名</div>
            </div>
          </div>
        </div>

        {/* シフト詳細またはエンプティステート */}
        <div className="space-y-4">
          {shiftStats.isEmpty ? (
            /* シフトなしの場合 */
            <div className="py-12 text-center text-muted-foreground">
              <Calendar className="mx-auto mb-4 h-16 w-16 opacity-50" />
              <div className="mb-2 text-xl font-medium">シフトが設定されていません</div>
              <div className="mb-4 text-sm">
                {shiftOptions?.clickable
                  ? 'この日付でシフトを作成できます'
                  : 'シフトがある日にはここに詳細が表示されます'}
              </div>

              {/* 新規作成ボタン（管理権限がある場合） */}
              {onCreateShift && (
                <button
                  onClick={onCreateShift}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <span className="text-lg">+</span>
                  新規シフト作成
                </button>
              )}
            </div>
          ) : (
            /* シフト詳細表示 */
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">シフト詳細</h3>
                <p className="text-sm text-muted-foreground">
                  部門別のシフト配置状況を確認できます
                  {shiftOptions?.clickable && '（タップして編集）'}
                </p>
              </div>

              <div className="space-y-4">
                {renderDepartmentSections(dayData.shifts, shiftOptions)}
              </div>

              {/* 新規作成ボタン（管理権限がある場合） */}
              {onCreateShift && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={onCreateShift}
                    className="inline-flex items-center gap-2 rounded-lg border border-dashed border-primary/50 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <span className="text-lg">+</span>
                    追加でシフト作成
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
