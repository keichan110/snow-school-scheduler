import { cache } from "react";
import { prisma } from "@/lib/db";
import type { UserWithDetails } from "./types";

/**
 * ユーザー一覧を取得（Server Component用）
 * React.cacheでメモ化され、同一リクエスト内での重複クエリを防止
 *
 * Next.js推奨パターン: Data Access Layer (DAL)
 * - 認証・認可チェックは親レイアウトで実施済み（ADMIN権限）
 */
export const getUsers = cache(async (): Promise<UserWithDetails[]> => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      lineUserId: true,
      displayName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [
      { role: "asc" }, // 権限順（ADMIN -> MANAGER -> MEMBER）
      { displayName: "asc" }, // 表示名順
    ],
  });

  // Date型をISO 8601文字列に変換してシリアライズ可能にする
  return users.map((user) => ({
    id: user.id,
    lineUserId: user.lineUserId,
    displayName: user.displayName,
    role: user.role as "ADMIN" | "MANAGER" | "MEMBER",
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }));
});
