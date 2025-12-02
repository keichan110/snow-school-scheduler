import { prisma } from "@/lib/db";
import type { DepartmentMinimal, ShiftTypeMinimal } from "@/lib/types/domain";
import type { InstructorWithAssignment, ShiftWithRelations } from "./types";

/**
 * 指定日のシフト一覧を取得
 *
 * @param date - 対象日付 (YYYY-MM-DD)
 * @returns シフト一覧（部門・シフト種別の昇順）
 */
export async function getShiftsByDate(
  date: string
): Promise<ShiftWithRelations[]> {
  const targetDate = new Date(date);

  const shifts = await prisma.shift.findMany({
    where: {
      date: targetDate,
    },
    include: {
      department: true,
      shiftType: true,
      shiftAssignments: {
        include: {
          instructor: true,
        },
      },
    },
    orderBy: [{ department: { code: "asc" } }, { shiftType: { name: "asc" } }],
  });

  return shifts;
}

/**
 * アクティブなインストラクター一覧を取得（指定日の配置状況も含む）
 *
 * @param date - 対象日付 (YYYY-MM-DD)
 * @returns インストラクター一覧（姓名の昇順）
 */
export async function getInstructorsWithAssignments(
  date: string
): Promise<InstructorWithAssignment[]> {
  const targetDate = new Date(date);

  const instructors = await prisma.instructor.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      shiftAssignments: {
        where: {
          shift: {
            date: targetDate,
          },
        },
        include: {
          shift: {
            include: {
              department: true,
              shiftType: true,
            },
          },
        },
      },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return instructors.map((instructor) => {
    // 配置されているシフトから部門を判定（最初のシフトの部門を使用）
    const firstAssignment = instructor.shiftAssignments[0];
    const departmentCode = firstAssignment
      ? firstAssignment.shift.department.code
      : "SKI"; // デフォルトはスキー部門

    return {
      id: instructor.id,
      displayName: `${instructor.lastName} ${instructor.firstName}`,
      displayNameKana: `${instructor.lastNameKana ?? ""} ${instructor.firstNameKana ?? ""}`,
      departmentCode,
      assignedToShiftIds: instructor.shiftAssignments.map((a) => a.shiftId),
      assignmentInfo: instructor.shiftAssignments.map((a) => ({
        shiftId: a.shiftId,
        departmentName: a.shift.department.name,
        shiftTypeName: a.shift.shiftType.name,
      })),
    };
  });
}

/**
 * 部門一覧を取得
 *
 * @returns 部門一覧（コードの昇順）
 */
export async function getDepartments(): Promise<DepartmentMinimal[]> {
  const departments = await prisma.department.findMany({
    orderBy: { code: "asc" },
  });

  return departments.map((dept) => ({
    id: dept.id,
    name: dept.name,
    code: dept.code,
  }));
}

/**
 * アクティブなシフト種別一覧を取得
 *
 * @returns シフト種別一覧（名前の昇順）
 */
export async function getActiveShiftTypes(): Promise<ShiftTypeMinimal[]> {
  const shiftTypes = await prisma.shiftType.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return shiftTypes.map((type) => ({
    id: type.id,
    name: type.name,
    isActive: type.isActive,
  }));
}
