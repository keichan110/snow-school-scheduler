'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { getWeekPeriodDisplay } from '../utils/weekCalculations';

interface WeekNavigationProps {
  baseDate: Date;
  onNavigate: (direction: number) => void;
  onDateSelect: (date: Date) => void;
}

export function WeekNavigation({ baseDate, onNavigate, onDateSelect }: WeekNavigationProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(baseDate);

  // 週の期間を表示用にフォーマット
  const weekPeriod = getWeekPeriodDisplay(baseDate);

  // 年月情報を取得
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth() + 1;

  // 日付選択時の処理（即座に移動）
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect(date);
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="sticky top-20 z-40 -mx-4 mb-4 border-b border-border/30 px-4 backdrop-blur-sm">
      <div className="py-3">
        {/* モバイル用レイアウト */}
        <div className="space-y-3 md:hidden">
          {/* 1行目: 前/次ボタン、期間表示、カレンダーボタン */}
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
                {year}年{month}月
              </h2>
              <p className="text-xs text-muted-foreground">{weekPeriod}</p>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate(1)}
                className="flex items-center gap-1 px-2 py-2"
              >
                次
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="ml-4 flex items-center px-2 py-2"
                >
                  <CalendarIcon className="h-3 w-3" />
                </Button>

                {isCalendarOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 rounded-md border bg-white p-3 shadow-lg">
                    <div className="mb-2 flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDateSelect(new Date())}
                        className="text-xs"
                      >
                        今日
                      </Button>
                    </div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      className="rounded-md border-0"
                    />
                  </div>
                )}
              </div>
            </div>
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
                {year}年{month}月
              </h2>
              <p className="text-sm text-muted-foreground">{weekPeriod}</p>
            </div>

            <Button
              variant="outline"
              onClick={() => onNavigate(1)}
              className="flex items-center gap-2"
            >
              来週
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="flex items-center gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>

              {isCalendarOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 rounded-md border bg-white p-3 shadow-lg">
                  <div className="mb-2 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDateSelect(new Date())}
                      className="text-xs"
                    >
                      今日
                    </Button>
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md border-0"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
