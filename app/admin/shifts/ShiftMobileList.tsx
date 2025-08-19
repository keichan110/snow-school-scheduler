'use client';

import { BaseShiftMobileList } from '@/components/shared/shift/BaseShiftMobileList';
import { ShiftMobileListProps } from '@/shared/types/shiftDisplayTypes';

export function ShiftMobileList(props: ShiftMobileListProps) {
  return <BaseShiftMobileList {...props} />;
}
