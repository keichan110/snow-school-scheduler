import { useCallback } from "react";
import type {
  AssignedInstructor,
  Department,
  Shift,
  ShiftStats,
} from "../types";
import { getDepartmentTypeById } from "../utils/shiftUtils";

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

        const departmentType = getDepartmentTypeById(
          shift.departmentId,
          departments
        );

        // アサイン済みインストラクター情報を抽出
        const assignedInstructors: AssignedInstructor[] = shift.assignments.map(
          (assignment) => ({
            id: assignment.instructor.id,
            lastName: assignment.instructor.lastName,
            firstName: assignment.instructor.firstName,
            displayName: `${assignment.instructor.lastName} ${assignment.instructor.firstName}`,
          })
        );

        // 同じ部門・シフト種別の組み合わせが既に存在するかチェック
        const existingShift = stats[date].shifts.find(
          (s) =>
            s.type === shift.shiftType.name && s.department === departmentType
        );

        if (existingShift) {
          // 既存のシフトに人数を加算し、インストラクターをマージ
          existingShift.count += shift.assignedCount;
          if (existingShift.assignedInstructors) {
            existingShift.assignedInstructors.push(...assignedInstructors);
          } else {
            existingShift.assignedInstructors = assignedInstructors;
          }
        } else {
          // 新しいシフトエントリを追加
          stats[date].shifts.push({
            type: shift.shiftType.name,
            department: departmentType,
            count: shift.assignedCount,
            assignedInstructors,
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
