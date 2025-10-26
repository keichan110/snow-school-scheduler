import type { DepartmentData } from "./types";

type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  message: string | null;
  error: string | null;
};

async function fetchDepartments(): Promise<DepartmentData[]> {
  const response = await fetch("/api/departments");
  const result: ApiResponse<DepartmentData[]> = await response.json();

  if (!(result.success && result.data)) {
    throw new Error(result.error || "Failed to fetch departments");
  }

  return result.data;
}

/**
 * Department名からIDを取得するヘルパー関数
 * Server Actionsへの入力データ変換に使用
 */
export async function getDepartmentIdByType(
  departmentType: "ski" | "snowboard"
): Promise<number> {
  const departments = await fetchDepartments();

  const targetDepartment = departments.find((dept) => {
    const name = dept.name.toLowerCase();
    if (departmentType === "ski") {
      return name.includes("スキー") || name.includes("ski");
    }
    return name.includes("スノーボード") || name.includes("snowboard");
  });

  if (!targetDepartment) {
    // デフォルトで最初のdepartmentのIDを返す
    return departments[0]?.id || 1;
  }

  return targetDepartment.id;
}
