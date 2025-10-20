import { Suspense } from "react";

import Loading from "./loading";
import PublicShiftsPageClient from "./public-shifts-page-client";

/**
 * シフト表示ページ
 * - MEMBER以上の権限が必要（親レイアウトで認証済み）
 * - ユーザー情報は AuthProvider から取得可能
 */
export default function ShiftsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PublicShiftsPageClient />
    </Suspense>
  );
}
