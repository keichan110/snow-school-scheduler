'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { getWeekPeriodDisplay } from '../utils/weekCalculations';
import { ja } from 'date-fns/locale';

interface WeekNavigationProps {
  baseDate: Date;
  onNavigate: (direction: number) => void;
  onDateSelect: (date: Date) => void;
}

export function WeekNavigation({ baseDate, onNavigate, onDateSelect }: WeekNavigationProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(baseDate);
  const calendarRef = useRef<HTMLDivElement>(null);

  // 週の期間を表示用にフォーマット
  const weekPeriod = getWeekPeriodDisplay(baseDate);

  // 日付選択時の処理（即座に移動）
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect(date);
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  // カレンダー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  return (
    <div className="sticky top-20 z-40 -mx-4 mb-4 border-b border-border/30 px-4 backdrop-blur-sm">
      <div className="py-3">
        {/* モバイル用レイアウト */}
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => onNavigate(-1)}
              className="flex touch-manipulation items-center gap-1 px-2 py-2 hover:shadow-md"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden text-sm font-medium sm:inline">前週</span>
            </Button>

            <div className="flex items-center gap-1">
              <h2 className="text-lg font-bold text-foreground">{weekPeriod}</h2>

              <div className="relative ml-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>

                {isCalendarOpen && (
                  <div
                    ref={calendarRef}
                    className="absolute right-0 top-full z-50 mt-2 rounded-md border bg-white p-3 shadow-lg"
                  >
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      locale={ja}
                      showOutsideDays={true}
                      captionLayout="dropdown"
                      fromYear={2020}
                      toYear={2030}
                      className="rounded-md border-0"
                    />
                    <div className="mt-2 flex justify-start">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDateSelect(new Date())}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        今日
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => onNavigate(1)}
              className="flex touch-manipulation items-center gap-1 px-2 py-2 hover:shadow-md"
            >
              <span className="hidden text-sm font-medium sm:inline">来週</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* デスクトップ用レイアウト */}
        <div className="hidden md:flex md:items-center md:justify-between">
          <Button
            variant="outline"
            onClick={() => onNavigate(-1)}
            className="flex touch-manipulation items-center gap-1 px-2 py-2 hover:shadow-md md:gap-2 md:px-4"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden text-sm font-medium sm:inline">前週</span>
          </Button>

          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground md:text-xl">{weekPeriod}</h2>

            <div className="relative ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>

              {isCalendarOpen && (
                <div
                  ref={calendarRef}
                  className="absolute left-0 top-full z-50 mt-2 rounded-md border bg-white p-3 shadow-lg"
                >
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    locale={ja}
                    showOutsideDays={true}
                    captionLayout="dropdown"
                    fromYear={2020}
                    toYear={2030}
                    className="rounded-md border-0"
                  />
                  <div className="mt-2 flex justify-start">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDateSelect(new Date())}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      今日
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => onNavigate(1)}
            className="flex touch-manipulation items-center gap-1 px-2 py-2 hover:shadow-md md:gap-2 md:px-4"
          >
            <span className="hidden text-sm font-medium sm:inline">来週</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
