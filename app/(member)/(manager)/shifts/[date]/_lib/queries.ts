import { prisma } from "@/lib/db";
import type { DepartmentMinimal, ShiftTypeMinimal } from "@/lib/types/domain";
import type { InstructorWithAssignment, ShiftWithRelations } from "./types";

/**
 * 指定日のシフト一覧を取得
 *
 * @param date - 対象日付 (YYYY-MM-DD)
 * @param departmentId - 部門ID（指定した場合、その部門のシフトのみを取得）
 * @returns シフト一覧（部門・シフト種別の昇順）
 */
export async function getShiftsByDate(
  date: string,
  departmentId?: number
): Promise<ShiftWithRelations[]> {
  const targetDate = new Date(date);

  const shifts = await prisma.shift.findMany({
    where: {
      date: targetDate,
      ...(departmentId && { departmentId }),
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
 * @param departmentId - 部門ID（指定した場合、その部門の資格を持つインストラクターのみを取得）
 * @returns インストラクター一覧（姓名の昇順）
 */
export async function getInstructorsWithAssignments(
  date: string,
  departmentId?: number
): Promise<InstructorWithAssignment[]> {
  const targetDate = new Date(date);

  const instructors = await prisma.instructor.findMany({
    where: {
      status: "ACTIVE",
      ...(departmentId && {
        certifications: {
          some: {
            certification: {
              departmentId,
            },
          },
        },
      }),
    },
    include: {
      shiftAssignments: {
        where: {
          shift: {
            date: targetDate,
            ...(departmentId && { departmentId }),
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
      certifications: {
        include: {
          certification: {
            include: {
              department: true,
            },
          },
        },
      },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return instructors.map((instructor) => {
    // 配置されているシフトから部門を判定（最初のシフトの部門を使用）
    // 部門IDが指定されている場合はそれを使用、なければ資格から判定
    let departmentCode: string;
    if (departmentId) {
      // 指定された部門IDに対応する資格を探す
      const targetCert = instructor.certifications.find(
        (ic) => ic.certification.departmentId === departmentId
      );
      departmentCode = targetCert?.certification.department.code ?? "SKI";
    } else {
      const firstAssignment = instructor.shiftAssignments[0];
      departmentCode = firstAssignment
        ? firstAssignment.shift.department.code
        : (instructor.certifications[0]?.certification.department.code ??
          "SKI");
    }

    // 資格情報をフィルタリング（部門IDが指定されている場合はその部門の資格のみ）
    const certifications = instructor.certifications
      .filter((ic) =>
        departmentId ? ic.certification.departmentId === departmentId : true
      )
      .map((ic) => ({
        certificationId: ic.certification.id,
        certificationName: ic.certification.shortName,
        departmentCode: ic.certification.department.code,
      }));

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
      certifications,
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
