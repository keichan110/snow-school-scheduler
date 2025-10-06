import { Suspense } from "react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import InvitationsPageClient from "./invitations-page-client";
import Loading from "./loading";

export const dynamic = "force-dynamic";
export default function InvitationsPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <Suspense fallback={<Loading />}>
        <InvitationsPageClient />
      </Suspense>
    </ProtectedRoute>
  );
}
