import { Suspense } from "react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Loading from "./loading";
import ShiftTypesPageClient from "./ShiftTypesPageClient";

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
