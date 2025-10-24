import { Suspense } from "react";

import InstructorsPageClient from "./_components/page-client";
import Loading from "./loading";

/**
 * インストラクター管理ページ
 * - MANAGER以上の権限が必要（親レイアウトで認証済み）
 */
export default function InstructorsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <InstructorsPageClient />
    </Suspense>
  );
}
