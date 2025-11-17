/**
 * ユーザー一覧向けのクエリキー
 *
 * 注意: Server Components移行により、useUsersQuery は削除されました。
 * データフェッチングは page.tsx で直接 Prisma クエリを使用してください（searchParams による URL ベースのフィルタリング）。
 * このファイルはクエリキー定義のみを保持しています（mutation用）。
 */
export const usersQueryKeys = {
  all: ["users"] as const,
  lists: () => [...usersQueryKeys.all, "list"] as const,
  list: () => [...usersQueryKeys.lists()] as const,
};
