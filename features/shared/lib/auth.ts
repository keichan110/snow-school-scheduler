"use server";
import { authenticateFromCookies } from "@/lib/auth/middleware";
import type { AuthenticatedUser } from "../types/actions";
import { ForbiddenError, UnauthorizedError } from "./auth-errors";

/**
 * Server Actions 用の認証ヘルパー
 * Cookie から JWT トークンを取得して検証し、データベースから最新のユーザー情報を返す
 *
 * セキュリティ重要: JWT ペイロードだけでなく、必ずデータベースで最新の isActive と role を確認します
 * これにより、無効化されたユーザーや権限変更後のユーザーが古いトークンで操作を継続できないようにします
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
    const result = await authenticateFromCookies();

    if (!(result.success && result.user)) {
      return null;
    }

    // データベースから取得した最新のユーザー情報を返す
    return {
      id: result.user.id,
      lineUserId: result.user.lineUserId,
      displayName: result.user.displayName,
      pictureUrl: result.user.pictureUrl ?? null,
      role: result.user.role,
    };
  } catch {
    // 認証フロー内での例外は認証失敗として扱う
    return null;
  }
}

/**
 * 管理者権限チェック
 * Server Action 内で管理者のみに操作を許可する場合に使用
 *
 * @returns 認証済み管理者ユーザー情報
 * @throws {UnauthorizedError} 未認証の場合
 * @throws {ForbiddenError} 管理者権限がない場合
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
    throw new UnauthorizedError();
  }
  if (user.role !== "ADMIN") {
    throw new ForbiddenError("Forbidden: Admin access required");
  }
  return user;
}

/**
 * マネージャー権限チェック
 * Server Action 内でマネージャー以上（ADMIN または MANAGER）に操作を許可する場合に使用
 *
 * @returns 認証済みマネージャー以上のユーザー情報
 * @throws {UnauthorizedError} 未認証の場合
 * @throws {ForbiddenError} マネージャー権限がない場合
 *
 * @example
 * ```typescript
 * export async function createDepartmentAction(input: unknown) {
 *   const user = await requireManagerAuth();
 *   // マネージャー以上専用処理...
 * }
 * ```
 */
export async function requireManagerAuth(): Promise<AuthenticatedUser> {
  const user = await authenticate();
  if (!user) {
    throw new UnauthorizedError();
  }
  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    throw new ForbiddenError("Forbidden: Manager or Admin access required");
  }
  return user;
}

/**
 * 認証必須チェック
 * Server Action 内で認証済みユーザーのみに操作を許可する場合に使用
 *
 * @returns 認証済みユーザー情報
 * @throws {UnauthorizedError} 未認証の場合
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
    throw new UnauthorizedError();
  }
  return user;
}
