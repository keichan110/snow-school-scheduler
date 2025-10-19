import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AuthProvider } from "@/contexts/auth-context";
import {
  ACCESS_DENIED_REDIRECT,
  buildLoginRedirectUrl,
} from "@/features/shared/lib/auth-redirect";
import { ensureRole } from "@/features/shared/lib/role-guard";

/**
 * MEMBER以上の権限を持つユーザー専用レイアウト
 * - 未認証ユーザーは `/login?redirect=...` へリダイレクト
 * - 権限不足の場合は `/` へリダイレクト（通常発生しないケース）
 * - 認証済みユーザー情報を AuthProvider に渡してクライアント側で利用可能にする
 */
export const dynamic = "force-dynamic";

type Props = {
  children: ReactNode;
};

export default async function MemberLayout({ children }: Props) {
  const result = await ensureRole({ atLeast: "MEMBER" });

  if (result.status === "unauthenticated") {
    redirect(await buildLoginRedirectUrl());
  }

  if (result.status === "forbidden") {
    redirect(ACCESS_DENIED_REDIRECT);
  }

  const { user } = result; // status === "authorized"

  // AuthProvider に初期ユーザー情報を渡してクライアント側での追加フェッチを回避
  return (
    <AuthProvider initialStatus="authenticated" initialUser={user}>
      {children}
    </AuthProvider>
  );
}
