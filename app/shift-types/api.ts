import type { ShiftType } from "./types";

const API_BASE = "/api/shift-types";

/**
 * シフト種類一覧を取得（READ専用）
 * Write操作はServer Actionsを使用してください
 */
export async function fetchShiftTypes(): Promise<ShiftType[]> {
  const response = await fetch(API_BASE);

  if (!response.ok) {
    throw new Error("シフト種類の取得に失敗しました");
  }

  const result = await response.json();

  if (result.success === false) {
    throw new Error(result.error || "シフト種類の取得に失敗しました");
  }

  return result.data || result;
}
