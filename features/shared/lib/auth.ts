"use server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth/jwt";
import type { AuthenticatedUser } from "../types/actions";

/**
 * Server Actions 用の認証ヘルパー
 * Cookie から JWT トークンを取得して検証し、ユーザー情報を返す
 *
 * @returns 認証済みユーザー情報、または null（未認証の場合）
 *
 * @example
 * ```typescript
 * export async function myAction() {
 *   const user = await authenticate();
 *   if (!user) {
 *     return { success: false, error: 'Unauthorized' };
 *   }
 *   // 認証済みの処理...
 * }
 * ```
 */
export async function authenticate(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const result = verifyJwt(token);
    if (!(result.success && result.payload)) {
      return null;
    }

    return {
      id: result.payload.userId,
      lineUserId: result.payload.lineUserId,
      displayName: result.payload.displayName,
      profileImageUrl: null, // JWT には pictureUrl が含まれていない場合があるため null
      role: result.payload.role,
    };
  } catch {
    return null;
  }
}

/**
 * 管理者権限チェック
 * Server Action 内で管理者のみに操作を許可する場合に使用
 *
 * @returns 認証済み管理者ユーザー情報
 * @throws {Error} 未認証または管理者権限がない場合
 *
 * @example
 * ```typescript
 * export async function deleteUserAction(id: string) {
 *   const admin = await requireAdmin();
 *   // 管理者専用処理...
 * }
 * ```
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await authenticate();
  if (!user) {
    throw new Error("Unauthorized");
  }
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}

/**
 * 認証必須チェック
 * Server Action 内で認証済みユーザーのみに操作を許可する場合に使用
 *
 * @returns 認証済みユーザー情報
 * @throws {Error} 未認証の場合
 *
 * @example
 * ```typescript
 * export async function createResourceAction(input: unknown) {
 *   const user = await requireAuth();
 *   // 認証済みユーザー向け処理...
 * }
 * ```
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await authenticate();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
