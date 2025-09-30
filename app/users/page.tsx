import { Suspense } from "react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Loading from "./loading";
import UsersPageClient from "./UsersPageClient";

export const dynamic = "force-dynamic";
export default function UsersPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <Suspense fallback={<Loading />}>
        <UsersPageClient />
      </Suspense>
    </ProtectedRoute>
  );
}
