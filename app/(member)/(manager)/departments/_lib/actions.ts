"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireManagerAuth } from "@/lib/auth/role-guard";
import { prisma } from "@/lib/db";
import type { ActionResult } from "@/types/actions";
import {
  type CreateDepartmentInput,
  createDepartmentSchema,
  type UpdateDepartmentInput,
  updateDepartmentSchema,
} from "./schemas";

/**
 * 部門作成アクション
 */
export async function createDepartmentAction(
  input: CreateDepartmentInput
): Promise<ActionResult<unknown>> {
  try {
    // 認証・権限チェック（マネージャー以上）
    await requireManagerAuth();

    // バリデーション
    const validated = createDepartmentSchema.parse(input);

    // DB操作
    const department = await prisma.department.create({
      data: validated,
    });

    // 再検証
    revalidatePath("/departments");
    revalidateTag("departments.list");

    return { success: true, data: department };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create department" };
  }
}

/**
 * 部門更新アクション
 */
export async function updateDepartmentAction(
  id: number,
  input: UpdateDepartmentInput
): Promise<ActionResult<unknown>> {
  try {
    // 認証・権限チェック（マネージャー以上）
    await requireManagerAuth();

    const validated = updateDepartmentSchema.parse(input);

    const department = await prisma.department.update({
      where: { id },
      data: validated,
    });

    revalidatePath("/departments");
    revalidateTag("departments.list");
    revalidateTag(`departments.detail.${id}`);

    return { success: true, data: department };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update department" };
  }
}

/**
 * 部門削除アクション（論理削除）
 */
export async function deleteDepartmentAction(
  id: number
): Promise<ActionResult<void>> {
  try {
    // 認証・権限チェック（マネージャー以上）
    await requireManagerAuth();

    // 論理削除（isActive = false）
    await prisma.department.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/departments");
    revalidateTag("departments.list");

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete department" };
  }
}
