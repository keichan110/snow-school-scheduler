import { redirect } from "next/navigation";
import { Suspense } from "react";

import { requireManagerAuth, UnauthorizedError } from "@/features/shared";

import CertificationsPageClient from "./certifications-page-client";
import Loading from "./loading";

export const dynamic = "force-dynamic";

export default async function CertificationsPage() {
  try {
    await requireManagerAuth();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(`/login?redirect=${encodeURIComponent("/certifications")}`);
    }
    // ForbiddenError or その他のエラー
    redirect("/");
  }

  return (
    <Suspense fallback={<Loading />}>
      <CertificationsPageClient />
    </Suspense>
  );
}
