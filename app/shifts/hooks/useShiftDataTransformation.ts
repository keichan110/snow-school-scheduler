import { useCallback } from 'react';
import { Shift, Department, ShiftStats } from '../../admin/shifts/types';
import { getDepartmentTypeById } from '../../admin/shifts/utils/shiftUtils';

/**
 * シフトデータ変換のカスタムフック
 */
export function useShiftDataTransformation() {
  // シフトデータを統計データに変換
  const transformShiftsToStats = useCallback(
    (shifts: Shift[], departments: Department[]): ShiftStats => {
      const stats: ShiftStats = {};

      shifts.forEach((shift) => {
        const date = shift.date;
        if (!stats[date]) {
          stats[date] = { shifts: [] };
        }

        const departmentType = getDepartmentTypeById(shift.departmentId, departments);

        // 同じ部門・シフト種別の組み合わせが既に存在するかチェック
        const existingShift = stats[date].shifts.find(
          (s) => s.type === shift.shiftType.name && s.department === departmentType
        );

        if (existingShift) {
          // 既存のシフトに人数を加算
          existingShift.count += shift.assignedCount;
        } else {
          // 新しいシフトエントリを追加
          stats[date].shifts.push({
            type: shift.shiftType.name,
            department: departmentType,
            count: shift.assignedCount,
          });
        }
      });

      return stats;
    },
    []
  );

  return {
    transformShiftsToStats,
  };
}
