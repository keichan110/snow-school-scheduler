import { Suspense } from "react";

import Loading from "./loading";
import UsersPageClient from "./users-page-client";

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
