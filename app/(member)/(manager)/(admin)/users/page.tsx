import UsersContent from "./_components/users-content";
import { getUsers } from "./_lib/data";

/**
 * ユーザー管理ページ（Server Component）
 * - ADMIN権限が必要（親レイアウトで認証済み）
 * - データはサーバーサイドで取得し、Client Componentに渡す
 */
export default async function UsersPage() {
  const users = await getUsers();

  return <UsersContent initialData={users} />;
}
