/**
 * ユーザー管理API クライアント
 */

import type {
  UpdateUserRequest,
  UserApiResponse,
  UserFilters,
  UserWithDetails,
} from "./types";

const API_BASE_URL = "/api/auth/users";

/**
 * ユーザー一覧取得
 */
export async function fetchUsers(
  filters?: Partial<UserFilters>
): Promise<UserWithDetails[]> {
  const searchParams = new URLSearchParams();

  if (filters?.role && filters.role !== "all") {
    searchParams.append("role", filters.role);
  }

  if (filters?.status && filters.status !== "all") {
    searchParams.append(
      "active",
      filters.status === "active" ? "true" : "false"
    );
  }

  const url = searchParams.toString()
    ? `${API_BASE_URL}?${searchParams.toString()}`
    : API_BASE_URL;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include", // Cookieベースの認証
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`ユーザー一覧の取得に失敗しました: ${response.status}`);
  }

  const result: UserApiResponse<{
    users: UserWithDetails[];
    total: number;
    page: number;
    limit: number;
  }> = await response.json();

  if (!(result.success && result.data)) {
    throw new Error(result.error || "ユーザー一覧の取得に失敗しました");
  }

  return result.data.users;
}

/**
 * ユーザー詳細取得
 */
export async function fetchUser(id: string): Promise<UserWithDetails> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "GET",
    credentials: "include", // Cookieベースの認証
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`ユーザー詳細の取得に失敗しました: ${response.status}`);
  }

  const result: UserApiResponse<UserWithDetails> = await response.json();

  if (!(result.success && result.data)) {
    throw new Error(result.error || "ユーザー詳細の取得に失敗しました");
  }

  return result.data;
}

/**
 * ユーザー情報更新
 */
export async function updateUser(
  id: string,
  data: UpdateUserRequest
): Promise<UserWithDetails> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    credentials: "include", // Cookieベースの認証
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`ユーザー情報の更新に失敗しました: ${response.status}`);
  }

  const result: UserApiResponse<UserWithDetails> = await response.json();

  if (!(result.success && result.data)) {
    throw new Error(result.error || "ユーザー情報の更新に失敗しました");
  }

  return result.data;
}

/**
 * ユーザー無効化
 */
export async function deactivateUser(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include", // Cookieベースの認証
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`ユーザーの無効化に失敗しました: ${response.status}`);
  }

  const result: UserApiResponse<void> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "ユーザーの無効化に失敗しました");
  }
}

/**
 * ロール表示名取得
 */
export function getRoleDisplayName(
  role: "ADMIN" | "MANAGER" | "MEMBER"
): string {
  const roleNames = {
    ADMIN: "管理者",
    MANAGER: "マネージャー",
    MEMBER: "メンバー",
  };
  return roleNames[role];
}

/**
 * ロール色取得
 */
export function getRoleColor(role: "ADMIN" | "MANAGER" | "MEMBER"): string {
  const roleColors = {
    ADMIN: "text-red-600 dark:text-red-400",
    MANAGER: "text-blue-600 dark:text-blue-400",
    MEMBER: "text-green-600 dark:text-green-400",
  };
  return roleColors[role];
}
