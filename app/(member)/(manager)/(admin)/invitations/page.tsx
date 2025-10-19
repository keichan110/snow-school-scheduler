import { Suspense } from "react";

import InvitationsPageClient from "./invitations-page-client";
import Loading from "./loading";

/**
 * 招待管理ページ
 * - ADMIN権限が必要（親レイアウトで認証済み）
 */
export default function InvitationsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <InvitationsPageClient />
    </Suspense>
  );
}
