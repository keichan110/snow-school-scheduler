import { Suspense } from "react";
import ShiftTypesPageClient from "./_components/page-client";
import Loading from "./loading";

/**
 * シフト種別管理ページ
 * - MANAGER以上の権限が必要（親レイアウトで認証済み）
 */
export default function ShiftTypesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ShiftTypesPageClient />
    </Suspense>
  );
}
