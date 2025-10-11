import { Suspense } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";

import InstructorsPageClient from "./instructors-page-client";
import Loading from "./loading";

export const dynamic = "force-dynamic";
export default function InstructorsPage() {
  return (
    <ProtectedRoute requiredRole="MANAGER">
      <Suspense fallback={<Loading />}>
        <InstructorsPageClient />
      </Suspense>
    </ProtectedRoute>
  );
}
