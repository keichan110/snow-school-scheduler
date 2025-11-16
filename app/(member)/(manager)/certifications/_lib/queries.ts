import { cache } from "react";
import "server-only";
import { prisma } from "@/lib/db";

/**
 * 資格一覧を取得する関数（キャッシュ付き）
 * 複数のコンポーネントから呼ばれても、同一リクエスト内では1回だけ実行される
 *
 * NOTE: この関数は他のページ（instructor-modal など）で使用されています。
 */
export const getCertifications = cache(
  async () =>
    await prisma.certification.findMany({
      where: { isActive: true },
      include: {
        department: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: "asc" },
    })
);

/**
 * Department名からIDを取得するヘルパー関数
 * Server Actionsへの入力データ変換に使用
 */
export async function getDepartmentIdByType(
  departmentType: "ski" | "snowboard"
): Promise<number> {
  const departments = await prisma.department.findMany({
    select: { id: true, name: true },
  });

  const targetDepartment = departments.find((dept) => {
    const name = dept.name.toLowerCase();
    if (departmentType === "ski") {
      return name.includes("スキー") || name.includes("ski");
    }
    return name.includes("スノーボード") || name.includes("snowboard");
  });

  if (!targetDepartment) {
    return departments[0]?.id || 1;
  }

  return targetDepartment.id;
}
