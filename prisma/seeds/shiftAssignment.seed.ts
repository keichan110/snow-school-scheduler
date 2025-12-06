import { isHoliday } from "japanese-holidays";
import type { PrismaClient } from "../../generated/prisma";
import type { DepartmentSeeds } from "./department.seed";
import type { InstructorSeed } from "./instructor.seed";
import type { ShiftSeed } from "./shift.seed";
import type { ShiftTypeSeeds } from "./shiftType.seed";

export async function seedShiftAssignments(
  prisma: PrismaClient,
  shifts: ShiftSeed[],
  instructors: InstructorSeed[],
  departments: DepartmentSeeds,
  shiftTypes: ShiftTypeSeeds
): Promise<void> {
  console.log("シフトアサインを作成中...");

  const { skiDepartment, snowboardDepartment } = departments;
  const {
    generalLessonType,
    groupLessonType,
    badgeTestType,
    prefectureEventType,
  } = shiftTypes;

  // アクティブなインストラクターのみを取得
  const activeInstructors = instructors.filter((i) => i.status === "ACTIVE");

  // インストラクターの資格情報を取得して部門別に分類
  const instructorCertifications =
    await prisma.instructorCertification.findMany({
      include: {
        certification: true,
      },
    });

  // 部門別にインストラクターを分類
  const skiInstructorIds = new Set<number>();
  const snowboardInstructorIds = new Set<number>();

  for (const ic of instructorCertifications) {
    if (ic.certification.departmentId === skiDepartment.id) {
      skiInstructorIds.add(ic.instructorId);
    } else if (ic.certification.departmentId === snowboardDepartment.id) {
      snowboardInstructorIds.add(ic.instructorId);
    }
  }

  const skiInstructors = activeInstructors.filter((i) =>
    skiInstructorIds.has(i.id)
  );
  const snowboardInstructors = activeInstructors.filter((i) =>
    snowboardInstructorIds.has(i.id)
  );

  // シフトタイプと条件に応じた必要人数を決定する関数
  function getRequiredInstructorCount(shift: ShiftSeed): number {
    // タイムゾーンの影響を受けないように、日付文字列から直接Dateオブジェクトを作成
    const shiftDate = new Date(shift.date);
    const dateString = shiftDate.toISOString().split("T")[0];
    const checkDate = new Date(`${dateString}T00:00:00`);
    const dayOfWeek = checkDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isNationalHoliday = isHoliday(checkDate);
    const isWeekendOrHoliday = isWeekend || isNationalHoliday;

    // スキー一般レッスン
    if (
      shift.departmentId === skiDepartment.id &&
      shift.shiftTypeId === generalLessonType.id
    ) {
      return isWeekendOrHoliday ? 5 : 3; // 休日5人、平日3人
    }

    // スノーボード一般レッスン
    if (
      shift.departmentId === snowboardDepartment.id &&
      shift.shiftTypeId === generalLessonType.id
    ) {
      return 3; // 常に3人
    }

    // バッジテスト（両部門とも3人）
    if (shift.shiftTypeId === badgeTestType.id) {
      return 3;
    }

    // 団体レッスン（2~4人）
    if (shift.shiftTypeId === groupLessonType.id) {
      return Math.floor(Math.random() * 3) + 2; // 2, 3, 4のいずれか
    }

    // 県連事業（1~2人）
    if (shift.shiftTypeId === prefectureEventType.id) {
      return Math.floor(Math.random() * 2) + 1; // 1 or 2
    }

    return 1; // デフォルト
  }

  // シフトにインストラクターを割り当て
  let assignmentCount = 0;
  let skiInstructorIndex = 0;
  let snowboardInstructorIndex = 0;

  for (const shift of shifts) {
    const requiredCount = getRequiredInstructorCount(shift);
    const assignedInstructors: InstructorSeed[] = [];

    // 部門に応じたインストラクタープールを取得
    const instructorPool =
      shift.departmentId === skiDepartment.id
        ? skiInstructors
        : snowboardInstructors;

    if (instructorPool.length === 0) {
      continue; // インストラクターがいない場合はスキップ
    }

    // 必要人数分のインストラクターを割り当て
    for (let i = 0; i < requiredCount; i++) {
      let instructor: InstructorSeed;

      if (shift.departmentId === skiDepartment.id) {
        instructor =
          skiInstructors[skiInstructorIndex % skiInstructors.length]!;
        skiInstructorIndex++;
      } else {
        instructor =
          snowboardInstructors[
            snowboardInstructorIndex % snowboardInstructors.length
          ]!;
        snowboardInstructorIndex++;
      }

      // 同じシフトに同じインストラクターを重複して割り当てないようにチェック
      if (!assignedInstructors.some((a) => a.id === instructor.id)) {
        assignedInstructors.push(instructor);
      }
    }

    // アサインを作成
    for (const instructor of assignedInstructors) {
      await prisma.shiftAssignment.create({
        data: {
          shiftId: shift.id,
          instructorId: instructor.id,
        },
      });
      assignmentCount++;
    }
  }

  console.log(`シフトアサイン: ${assignmentCount}件作成`);
  console.log(`   - スキー担当: ${skiInstructors.length}名`);
  console.log(`   - スノーボード担当: ${snowboardInstructors.length}名`);
}
