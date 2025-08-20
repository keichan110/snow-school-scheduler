'use client';

import { Calendar } from '@phosphor-icons/react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { DayData } from '../../admin/shifts/types';
import { renderDepartmentSections } from '../utils/shiftComponents';
import { formatDateForDisplay } from '@/shared/utils/dateFormatter';

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

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="pb-2 text-center">
          <DrawerTitle className="flex items-center justify-center gap-2 text-xl md:text-2xl">
            {formatDateForDisplay(selectedDate)}
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
                {/* 部門別セクション表示（統合版・表示専用） */}
                {renderDepartmentSections(dayData.shifts)}
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
