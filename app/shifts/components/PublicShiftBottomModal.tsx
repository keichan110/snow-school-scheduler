'use client';

import { DayData } from '../types';
import { renderDepartmentSections } from '../utils/shiftComponents';
import { PublicShiftModal } from '@/components/shared/modals/BaseShiftModal';

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
  return (
    <PublicShiftModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      selectedDate={selectedDate}
      dayData={dayData}
    >
      {/* 部門別セクション表示（統合版・表示専用） */}
      {dayData && renderDepartmentSections(dayData.shifts)}
    </PublicShiftModal>
  );
}
