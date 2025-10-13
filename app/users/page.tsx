import { Suspense } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import Loading from "./loading";
import UsersPageClient from "./users-page-client";

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
