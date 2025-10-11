import { Suspense } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import Loading from "./loading";
import ShiftTypesPageClient from "./shift-types-page-client";

export const dynamic = "force-dynamic";
export default function ShiftTypesPage() {
  return (
    <ProtectedRoute requiredRole="MANAGER">
      <Suspense fallback={<Loading />}>
        <ShiftTypesPageClient />
      </Suspense>
    </ProtectedRoute>
  );
}
