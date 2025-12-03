/**
 * 型定義 - 1日単位のシフト管理
 */

import type { DepartmentMinimal, ShiftTypeMinimal } from "@/lib/types/domain";

// 共通型を再エクスポート
export type { DepartmentMinimal, ShiftTypeMinimal } from "@/lib/types/domain";

/**
 * シフト枠の状態
 */
export type ShiftSlot = {
  /** シフトID (null = 新規作成中) */
  id: number | null;

  /** 部門ID */
  departmentId: number;

  /** シフト種別ID */
  shiftTypeId: number;

  /** 備考 */
  description: string;

  /** 割り当てられたインストラクターのID配列 */
  instructorIds: number[];

  /** UI状態: 編集中かどうか */
  isEditing: boolean;

  /** UI状態: 新規作成中かどうか */
  isNew: boolean;
};

/**
 * インストラクター情報（配置状況付き）
 */
export type InstructorWithAssignment = {
  /** インストラクターID */
  id: number;

  /** 表示名（姓名） */
  displayName: string;

  /** 表示名（カナ） */
  displayNameKana: string;

  /** 部門コード (SKI / SNOWBOARD) */
  departmentCode: string;

  /** 割り当て済みのシフトID配列 */
  assignedToShiftIds: number[];

  /** 配置状況の詳細情報 */
  assignmentInfo: Array<{
    shiftId: number;
    departmentName: string;
    shiftTypeName: string;
  }>;

  /** 資格情報 */
  certifications: Array<{
    certificationName: string;
    departmentCode: string;
  }>;
};

/**
 * 1日分のシフト管理データ
 */
export type DayShiftData = {
  /** 対象日付 (YYYY-MM-DD) */
  date: string;

  /** シフト枠の配列 */
  shiftSlots: ShiftSlot[];

  /** 利用可能なインストラクター一覧 */
  availableInstructors: InstructorWithAssignment[];

  /** 部門一覧 */
  departments: DepartmentMinimal[];

  /** シフト種別一覧 */
  shiftTypes: ShiftTypeMinimal[];

  /** 事前選択された部門ID（URLパラメーターから） */
  preselectedDepartmentId?: number;
};

/**
 * データベースから取得したシフト情報（型安全性のため明示）
 */
export type ShiftWithRelations = {
  id: number;
  date: Date;
  departmentId: number;
  shiftTypeId: number;
  description: string | null;
  department: {
    id: number;
    name: string;
    code: string;
  };
  shiftType: {
    id: number;
    name: string;
    isActive: boolean;
  };
  shiftAssignments: Array<{
    id: number;
    shiftId: number;
    instructorId: number;
    instructor: {
      id: number;
      lastName: string;
      firstName: string;
      lastNameKana: string | null;
      firstNameKana: string | null;
      status: string;
      notes: string | null;
    };
  }>;
};
