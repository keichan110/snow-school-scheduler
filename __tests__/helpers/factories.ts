/**
 * テストデータファクトリー
 *
 * テストで使用するダミーデータの生成関数を提供します。
 * Prismaのスキーマ定義に基づいて、各エンティティのファクトリー関数を定義しています。
 */

import type {
  Department,
  Instructor,
  Certification,
  Shift,
  ShiftType,
  ShiftAssignment,
  InstructorStatus,
} from '@prisma/client';

// カウンター（ユニークなID生成用）
let departmentCounter = 1;
let instructorCounter = 1;
let certificationCounter = 1;
let shiftCounter = 1;
let shiftTypeCounter = 1;
let assignmentCounter = 1;

/**
 * 部門データファクトリー
 */
export const createDepartment = (overrides: Partial<Department> = {}): Department => {
  const id = departmentCounter++;
  return {
    id,
    code: `DEPT${String(id).padStart(3, '0')}`,
    name: `テスト部門${id}`,
    description: `テスト用の部門説明${id}`,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

/**
 * インストラクターデータファクトリー
 */
export const createInstructor = (overrides: Partial<Instructor> = {}): Instructor => {
  const id = instructorCounter++;
  return {
    id,
    lastName: `テスト姓${id}`,
    firstName: `テスト名${id}`,
    lastNameKana: `テストセイ${id}`,
    firstNameKana: `テストメイ${id}`,
    status: 'ACTIVE' as InstructorStatus,
    notes: `テスト用のメモ${id}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

/**
 * 資格データファクトリー
 */
export const createCertification = (overrides: Partial<Certification> = {}): Certification => {
  const id = certificationCounter++;
  return {
    id,
    departmentId: 1, // デフォルト部門ID
    name: `テスト資格${id}`,
    shortName: `資格${id}`,
    organization: `テスト団体${id}`,
    description: `テスト用の資格説明${id}`,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

/**
 * シフト種別データファクトリー
 */
export const createShiftType = (overrides: Partial<ShiftType> = {}): ShiftType => {
  const id = shiftTypeCounter++;
  return {
    id,
    name: `テストシフト種別${id}`,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

/**
 * シフトデータファクトリー
 */
export const createShift = (overrides: Partial<Shift> = {}): Shift => {
  const id = shiftCounter++;
  const now = new Date();
  const defaultDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + id);

  return {
    id,
    date: defaultDate,
    departmentId: 1, // デフォルト部門ID
    shiftTypeId: 1, // デフォルトシフト種別ID
    description: `テスト用のシフト説明${id}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

/**
 * シフト割り当てデータファクトリー
 */
export const createShiftAssignment = (
  overrides: Partial<ShiftAssignment> = {}
): ShiftAssignment => {
  const id = assignmentCounter++;
  return {
    id,
    shiftId: 1, // デフォルトシフトID
    instructorId: 1, // デフォルトインストラクターID
    assignedAt: new Date(),
    ...overrides,
  };
};

/**
 * 複数レコードの一括生成ヘルパー
 */
export const createDepartments = (
  count: number,
  overridesList?: Partial<Department>[]
): Department[] =>
  Array.from({ length: count }, (_, index) => createDepartment(overridesList?.[index] || {}));

export const createInstructors = (
  count: number,
  overridesList?: Partial<Instructor>[]
): Instructor[] =>
  Array.from({ length: count }, (_, index) => createInstructor(overridesList?.[index] || {}));

export const createCertifications = (
  count: number,
  overridesList?: Partial<Certification>[]
): Certification[] =>
  Array.from({ length: count }, (_, index) => createCertification(overridesList?.[index] || {}));

export const createShifts = (count: number, overridesList?: Partial<Shift>[]): Shift[] =>
  Array.from({ length: count }, (_, index) => createShift(overridesList?.[index] || {}));

export const createShiftAssignments = (
  count: number,
  overridesList?: Partial<ShiftAssignment>[]
): ShiftAssignment[] =>
  Array.from({ length: count }, (_, index) => createShiftAssignment(overridesList?.[index] || {}));

/**
 * 関連データを含む複合ファクトリー
 */
export const createCertificationWithDepartment = (
  certificationOverrides: Partial<Certification> = {},
  departmentOverrides: Partial<Department> = {}
) => {
  const department = createDepartment(departmentOverrides);
  const certification = createCertification({
    departmentId: department.id,
    ...certificationOverrides,
  });

  return { certification, department };
};

export const createShiftWithAssignments = (
  shiftOverrides: Partial<Shift> = {},
  assignmentCount: number = 2,
  assignmentOverrides: Partial<ShiftAssignment>[] = []
) => {
  const shift = createShift(shiftOverrides);
  const assignments = Array.from({ length: assignmentCount }, (_, index) =>
    createShiftAssignment({
      shiftId: shift.id,
      instructorId: index + 1,
      ...assignmentOverrides[index],
    })
  );

  return { shift, assignments };
};

/**
 * ファクトリーカウンターのリセット関数（テスト間で使用）
 */
export const resetFactoryCounters = () => {
  departmentCounter = 1;
  instructorCounter = 1;
  certificationCounter = 1;
  shiftCounter = 1;
  shiftTypeCounter = 1;
  assignmentCounter = 1;
};
