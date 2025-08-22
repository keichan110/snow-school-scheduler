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
export const createDepartment = (overrides: Partial<Department> = {}): Department => ({
  id: departmentCounter++,
  name: `テスト部門${departmentCounter}`,
  description: `テスト用の部門説明${departmentCounter}`,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * インストラクターデータファクトリー
 */
export const createInstructor = (overrides: Partial<Instructor> = {}): Instructor => ({
  id: instructorCounter++,
  name: `テストインストラクター${instructorCounter}`,
  email: `instructor${instructorCounter}@test.example.com`,
  phone: `090-0000-${String(instructorCounter).padStart(4, '0')}`,
  departmentId: 1, // デフォルト部門ID
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * 資格データファクトリー
 */
export const createCertification = (overrides: Partial<Certification> = {}): Certification => ({
  id: certificationCounter++,
  name: `テスト資格${certificationCounter}`,
  description: `テスト用の資格説明${certificationCounter}`,
  level: (certificationCounter % 3) + 1, // 1-3のレベル
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * シフト種別データファクトリー
 */
export const createShiftType = (overrides: Partial<ShiftType> = {}): ShiftType => ({
  id: shiftTypeCounter++,
  name: `テストシフト種別${shiftTypeCounter}`,
  description: `テスト用のシフト種別説明${shiftTypeCounter}`,
  color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // ランダムカラー
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * シフトデータファクトリー
 */
export const createShift = (overrides: Partial<Shift> = {}): Shift => {
  const now = new Date();
  const defaultDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + shiftCounter);

  return {
    id: shiftCounter++,
    title: `テストシフト${shiftCounter}`,
    date: defaultDate,
    startTime: '09:00',
    endTime: '17:00',
    requiredInstructors: 2,
    shiftTypeId: 1, // デフォルトシフト種別ID
    departmentId: 1, // デフォルト部門ID
    notes: `テスト用のメモ${shiftCounter}`,
    isActive: true,
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
): ShiftAssignment => ({
  id: assignmentCounter++,
  shiftId: 1, // デフォルトシフトID
  instructorId: 1, // デフォルトインストラクターID
  assignedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

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
export const createInstructorWithDepartment = (
  instructorOverrides: Partial<Instructor> = {},
  departmentOverrides: Partial<Department> = {}
) => {
  const department = createDepartment(departmentOverrides);
  const instructor = createInstructor({
    departmentId: department.id,
    ...instructorOverrides,
  });

  return { instructor, department };
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
