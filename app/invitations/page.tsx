import { redirect } from "next/navigation";
import { Suspense } from "react";

import { requireAdmin, UnauthorizedError } from "@/features/shared";

import InvitationsPageClient from "./invitations-page-client";
import Loading from "./loading";

export default async function InvitationsPage() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(`/login?redirect=${encodeURIComponent("/invitations")}`);
    }
    // ForbiddenError or その他のエラー
    redirect("/");
  }

  return (
    <Suspense fallback={<Loading />}>
      <InvitationsPageClient />
    </Suspense>
  );
}
