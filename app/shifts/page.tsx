import { redirect } from "next/navigation";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { Suspense } from "react";

import { authenticateFromCookies } from "@/lib/auth/middleware";

import Loading from "./loading";
import PublicShiftsPageClient from "./public-shifts-page-client";

export const dynamic = "force-dynamic";

type SearchParamsType =
  | Record<string, string | string[] | undefined>
  | ReadonlyURLSearchParams
  | null
  | undefined;

type ShiftsPageProps = {
  searchParams: SearchParamsType | Promise<SearchParamsType>;
};

function isReadonlyURLSearchParams(
  params: SearchParamsType
): params is ReadonlyURLSearchParams {
  return (
    typeof params?.forEach === "function" &&
    typeof params?.[Symbol.iterator] === "function"
  );
}

/**
 * searchParams からクエリパラメータ付きの完全なパスを構築
 */
function buildFullPath(params: SearchParamsType, basePath: string): string {
  if (!params) {
    return basePath;
  }

  if (isReadonlyURLSearchParams(params)) {
    const query = new URLSearchParams(Array.from(params)).toString();
    return query === "" ? basePath : `${basePath}?${query}`;
  }

  const queryString = new URLSearchParams();

  for (const [key, value] of Object.entries(
    params as Record<string, string | string[] | undefined>
  )) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined) {
          queryString.append(key, item);
        }
      });
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
