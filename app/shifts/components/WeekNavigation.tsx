'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface WeekNavigationProps {
  year: number;
  month: number;
  week: number;
  onNavigate: (direction: number) => void;
  onCurrentWeek: () => void;
}

export function WeekNavigation({
  year,
  month,
  week,
  onNavigate,
  onCurrentWeek,
}: WeekNavigationProps) {
  // 週の期間を表示用にフォーマット
  const getWeekPeriod = () => {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // その月の第1週の月曜日を基準とする
    const firstMonday = new Date(firstDayOfMonth);
    const daysToFirstMonday = firstDayOfWeek === 0 ? 1 : 8 - firstDayOfWeek;
    firstMonday.setDate(firstMonday.getDate() + daysToFirstMonday);

    // 指定された週の開始日を計算
    const weekStart = new Date(firstMonday);
    weekStart.setDate(weekStart.getDate() + (week - 1) * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const formatDate = (date: Date) => {
      const m = date.getMonth() + 1;
      const d = date.getDate();
      const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
      const dayName = dayNames[date.getDay()];
      return `${m}/${d}(${dayName})`;
    };

    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  };

  return (
    <div className="sticky top-20 z-40 -mx-4 mb-4 border-b border-border/30 bg-background/80 px-4 backdrop-blur-sm">
      <div className="py-3">
        {/* モバイル用レイアウト */}
        <div className="space-y-3 md:hidden">
          {/* 1行目: 前/次ボタンと期間表示 */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(-1)}
              className="flex items-center gap-1 px-2 py-2"
            >
              <ChevronLeft className="h-4 w-4" />前
            </Button>

            <div className="text-center">
              <h2 className="text-base font-bold text-foreground">
                {year}年{month}月 第{week}週
              </h2>
              <p className="text-xs text-muted-foreground">{getWeekPeriod()}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(1)}
              className="flex items-center gap-1 px-2 py-2"
            >
              次
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* 2行目: 今週に戻るボタン */}
          <div className="flex justify-center">
            <Button
              variant="default"
              size="sm"
              onClick={onCurrentWeek}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-3 w-3" />
              今週に戻る
            </Button>
          </div>
        </div>

        {/* デスクトップ用レイアウト */}
        <div className="hidden md:flex md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => onNavigate(-1)}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              前週
            </Button>

            <div className="text-center">
              <h2 className="text-lg font-bold text-foreground">
                {year}年{month}月 第{week}週
              </h2>
              <p className="text-sm text-muted-foreground">{getWeekPeriod()}</p>
            </div>

            <Button
              variant="outline"
              onClick={() => onNavigate(1)}
              className="flex items-center gap-2"
            >
              来週
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button variant="default" onClick={onCurrentWeek} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              今週に戻る
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
