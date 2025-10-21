"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireManagerAuth } from "@/features/shared/lib/role-guard";
import type { ActionResult } from "@/features/shared/types/actions";
import { prisma } from "@/lib/db";
import {
  type CreateCertificationInput,
  createCertificationSchema,
  type UpdateCertificationInput,
  updateCertificationSchema,
} from "./schemas";

/**
 * 資格作成アクション
 */
export async function createCertificationAction(
  input: CreateCertificationInput
): Promise<ActionResult<unknown>> {
  try {
    // 認証・権限チェック（マネージャー以上）
    await requireManagerAuth();

    // バリデーション
    const validated = createCertificationSchema.parse(input);

    // DB操作
    const certification = await prisma.certification.create({
      data: validated,
      include: {
        department: {
          select: { id: true, name: true },
        },
      },
    });

    // 再検証
    revalidatePath("/certifications");
    revalidateTag("certifications.list");

    return { success: true, data: certification };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create certification" };
  }
}

/**
 * 資格更新アクション
 */
export async function updateCertificationAction(
  id: number,
  input: UpdateCertificationInput
): Promise<ActionResult<unknown>> {
  try {
    // 認証・権限チェック（マネージャー以上）
    await requireManagerAuth();

    const validated = updateCertificationSchema.parse(input);

    const certification = await prisma.certification.update({
      where: { id },
      data: validated,
      include: {
        department: {
          select: { id: true, name: true },
        },
      },
    });

    revalidatePath("/certifications");
    revalidateTag("certifications.list");
    revalidateTag(`certifications.detail.${id}`);

    return { success: true, data: certification };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update certification" };
  }
}

/**
 * 資格削除アクション（論理削除）
 */
export async function deleteCertificationAction(
  id: number
): Promise<ActionResult<void>> {
  try {
    // 認証・権限チェック（マネージャー以上）
    await requireManagerAuth();

    // 論理削除（isActive = false）
    await prisma.certification.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/certifications");
    revalidateTag("certifications.list");

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete certification" };
  }
}
