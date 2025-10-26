import { Suspense } from "react";
import UsersPageClient from "./_components/page-client";
import Loading from "./loading";

/**
 * ユーザー管理ページ
 * - ADMIN権限が必要（親レイアウトで認証済み）
 */
export default function UsersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <UsersPageClient />
    </Suspense>
  );
}
