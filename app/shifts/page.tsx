import { redirect } from "next/navigation";
import { Suspense } from "react";

import { authenticateFromCookies } from "@/lib/auth/middleware";

import Loading from "./loading";
import PublicShiftsPageClient from "./public-shifts-page-client";

export const dynamic = "force-dynamic";

type ShiftsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * searchParams からクエリパラメータ付きの完全なパスを構築
 */
function buildFullPath(
  params: Record<string, string | string[] | undefined>,
  basePath: string
): string {
  const queryString = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined) {
          queryString.append(key, item);
        }
      }
    } else {
      queryString.append(key, value);
    }
  }

  const query = queryString.toString();
  return query === "" ? basePath : `${basePath}?${query}`;
}

export default async function ShiftsPage({ searchParams }: ShiftsPageProps) {
  const result = await authenticateFromCookies();

  if (!(result.success && result.user)) {
    const params = await searchParams;
    const fullPath = buildFullPath(params, "/shifts");
    redirect(`/login?redirect=${encodeURIComponent(fullPath)}`);
  }

  return (
    <Suspense fallback={<Loading />}>
      <PublicShiftsPageClient user={result.user} />
    </Suspense>
  );
}
