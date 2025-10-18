import { redirect } from "next/navigation";
import { Suspense } from "react";

import { requireManagerAuth, UnauthorizedError } from "@/features/shared";

import Loading from "./loading";
import ShiftTypesPageClient from "./shift-types-page-client";

export const dynamic = "force-dynamic";

export default async function ShiftTypesPage() {
  try {
    await requireManagerAuth();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(`/login?redirect=${encodeURIComponent("/shift-types")}`);
    }
    // ForbiddenError or その他のエラー
    redirect("/");
  }

  return (
    <Suspense fallback={<Loading />}>
      <ShiftTypesPageClient />
    </Suspense>
  );
}
