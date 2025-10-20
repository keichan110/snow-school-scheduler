import { Suspense } from "react";

import CertificationsPageClient from "./certifications-page-client";
import Loading from "./loading";

/**
 * 資格管理ページ
 * - MANAGER以上の権限が必要（親レイアウトで認証済み）
 */
export default function CertificationsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CertificationsPageClient />
    </Suspense>
  );
}
