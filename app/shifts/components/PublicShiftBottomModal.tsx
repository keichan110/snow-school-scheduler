'use client';

import { Calendar, PersonSimpleSki, PersonSimpleSnowboard } from '@phosphor-icons/react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DayData } from '../../admin/shifts/types';
import { DEPARTMENT_STYLES } from '../../admin/shifts/constants/shiftConstants';
import { createDepartmentSection } from '../utils/shiftComponents';

interface PublicShiftBottomModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string | null;
  dayData: DayData | null;
}

export function PublicShiftBottomModal({
  isOpen,
  onOpenChange,
  selectedDate,
  dayData,
}: PublicShiftBottomModalProps) {
  if (!selectedDate || !dayData) return null;

  const formatSelectedDate = () => {
    try {
      const date = new Date(selectedDate);
      const dateStr = date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const weekdayStr = date.toLocaleDateString('ja-JP', {
        weekday: 'short',
      });
      return `${dateStr}（${weekdayStr}）`;
    } catch {
      return selectedDate;
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="pb-2 text-center">
          <DrawerTitle className="flex items-center justify-center gap-2 text-xl md:text-2xl">
            {formatSelectedDate()}
          </DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-4">
          <div className="space-y-4">
            {dayData.shifts.length === 0 ? (
              /* シフトなしの場合 */
              <div className="py-8 text-center text-muted-foreground">
                <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <div className="text-lg font-medium">シフトが設定されていません</div>
                <div className="mt-1 text-sm">この日はシフトの設定がありません</div>
              </div>
            ) : (
              /* シフトがある場合 */
              <>
                {/* スキー部門 */}
                {dayData.shifts.filter((s) => s.department === 'ski').length > 0 &&
                  createDepartmentSection(
                    'ski',
                    dayData.shifts,
                    <PersonSimpleSki
                      className={cn('h-5 w-5', DEPARTMENT_STYLES.ski.iconColor)}
                      weight="fill"
                    />
                  )}

                {/* スノーボード部門 */}
                {dayData.shifts.filter((s) => s.department === 'snowboard').length > 0 &&
                  createDepartmentSection(
                    'snowboard',
                    dayData.shifts,
                    <PersonSimpleSnowboard
                      className={cn('h-5 w-5', DEPARTMENT_STYLES.snowboard.iconColor)}
                      weight="fill"
                    />
                  )}

                {/* 共通部門 */}
                {dayData.shifts.filter((s) => s.department === 'mixed').length > 0 &&
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
        </div>

        <div className="border-t bg-background px-4 py-4">
          <DrawerClose asChild>
            <Button variant="outline" size="lg" className="w-full">
              閉じる
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
