'use client';

import { BaseShiftMobileList } from './BaseShiftMobileList';
import { BaseShiftDisplayProps } from '@/shared/types/shiftDisplayTypes';

/**
 * 統合モバイルリストコンポーネントのProps型
 * 管理者画面と公開画面で共通利用
 */
interface UnifiedShiftMobileListProps extends BaseShiftDisplayProps {
  /** バリアント（将来の拡張用） */
  variant?: 'admin' | 'public';
}

/**
 * 統合モバイルリストコンポーネント
 * 管理者画面と公開画面で共通のモバイルリスト表示を提供
 */
export function ShiftMobileList(props: UnifiedShiftMobileListProps) {
  return <BaseShiftMobileList {...props} />;
}
