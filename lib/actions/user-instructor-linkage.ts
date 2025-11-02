"use server";

import { authenticate } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import type {
  ActionResult,
  InstructorBasicInfo,
  UserInstructorProfile,
} from "@/types/actions";

/**
 * 現在ログイン中のユーザーにインストラクターを紐付ける
 * ユーザー自身のみが実行可能
 *
 * Note: 複数のユーザーが同じインストラクターに紐付けることが可能
 * （例：LINEアカウントを作り直した場合など）
 *
 * @param instructorId - 紐付けるインストラクターID
 * @returns 成功時はsuccess: true、失敗時はerrorメッセージ
 */
export async function linkMyInstructor(
  instructorId: number
): Promise<ActionResult<void>> {
  const user = await authenticate();

  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  // 既に同じインストラクターに紐付けられている場合は何もしない
  if (user.instructorId === instructorId) {
    return { success: true, data: undefined };
  }

  try {
    // インストラクターの存在確認とステータス検証
    const instructor = await prisma.instructor.findUnique({
      where: { id: instructorId },
    });

    if (!instructor) {
      return { success: false, error: "インストラクターが見つかりません" };
    }

    if (instructor.status !== "ACTIVE") {
      return { success: false, error: "このインストラクターは利用できません" };
    }

    // 紐付け実行
    await prisma.user.update({
      where: { id: user.id },
      data: { instructorId },
    });

    return { success: true, data: undefined };
  } catch (_error) {
    return { success: false, error: "紐付けに失敗しました" };
  }
}

/**
 * 現在ログイン中のユーザーのインストラクター紐付けを解除する
 *
 * @returns 成功時はsuccess: true、失敗時はerrorメッセージ
 */
export async function unlinkMyInstructor(): Promise<ActionResult<void>> {
  const user = await authenticate();

  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { instructorId: null },
    });

    return { success: true, data: undefined };
  } catch (_error) {
    return { success: false, error: "紐付け解除に失敗しました" };
  }
}

/**
 * 紐付け可能なインストラクター一覧を取得
 *
 * ACTIVE状態のインストラクターのみを返す
 *
 * Note:
 * - 複数のユーザーが同じインストラクターに紐付け可能なため、
 *   他のユーザーに紐付けられているかどうかのフィルタリングは行わない
 * - この関数はClient Componentから呼ばれることを想定
 *   Server Componentからは直接Prismaクエリを使用すること
 *
 * @returns インストラクター基本情報の配列
 */
export async function getAvailableInstructors(): Promise<
  ActionResult<InstructorBasicInfo[]>
> {
  const user = await authenticate();

  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  try {
    const instructors = await prisma.instructor.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        lastName: true,
        firstName: true,
        lastNameKana: true,
        firstNameKana: true,
        status: true,
      },
      orderBy: [{ lastNameKana: "asc" }, { firstNameKana: "asc" }],
    });

    return { success: true, data: instructors };
  } catch (_error) {
    return {
      success: false,
      error: "インストラクター一覧の取得に失敗しました",
    };
  }
}

/**
 * 現在ログイン中のユーザーに紐付けられたインストラクターの詳細情報を取得
 *
 * 資格情報も含めて返す
 *
 * Note:
 * - この関数はClient Componentから呼ばれることを想定
 *   Server Componentからは直接Prismaクエリを使用すること
 *
 * @returns インストラクター詳細情報、未紐付けの場合はnull
 */
export async function getMyInstructorProfile(): Promise<
  ActionResult<UserInstructorProfile | null>
> {
  const user = await authenticate();

  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  if (!user.instructorId) {
    return { success: true, data: null };
  }

  try {
    const instructor = await prisma.instructor.findUnique({
      where: { id: user.instructorId },
      include: {
        certifications: {
          include: {
            certification: {
              select: {
                id: true,
                name: true,
                shortName: true,
                organization: true,
              },
            },
          },
        },
      },
    });

    if (!instructor) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        id: instructor.id,
        lastName: instructor.lastName,
        firstName: instructor.firstName,
        lastNameKana: instructor.lastNameKana,
        firstNameKana: instructor.firstNameKana,
        status: instructor.status,
        certifications: instructor.certifications.map((ic) => ic.certification),
      },
    };
  } catch (_error) {
    return {
      success: false,
      error: "インストラクター情報の取得に失敗しました",
    };
  }
}
