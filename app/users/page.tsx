import { redirect } from "next/navigation";
import { Suspense } from "react";

import { requireAdmin, UnauthorizedError } from "@/features/shared";

import Loading from "./loading";
import UsersPageClient from "./users-page-client";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(`/login?redirect=${encodeURIComponent("/users")}`);
    }
    // ForbiddenError or その他のエラー
    redirect("/");
  }

  return (
    <Suspense fallback={<Loading />}>
      <UsersPageClient />
    </Suspense>
  );
}
