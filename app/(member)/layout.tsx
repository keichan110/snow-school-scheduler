import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { HeaderAuthenticated } from "@/app/_components/header-authenticated";
import { AuthProvider } from "@/app/_providers/auth";
import {
  ACCESS_DENIED_REDIRECT,
  buildLoginRedirectUrl,
} from "@/lib/auth/auth-redirect";
import { ensureRole } from "@/lib/auth/role-guard";

/**
 * MEMBER以上の権限を持つユーザー専用レイアウト
 *
 * このレイアウトの役割：
 * 1. サーバー側でMEMBER以上の権限をチェック
 * 2. 未認証・権限不足ユーザーを適切にリダイレクト
 * 3. 認証済みユーザー情報をAuthProviderに渡してクライアント側で即座に利用可能にする
 * 4. サーバー取得済みのユーザー情報を使ってHeaderAuthenticatedを表示
 *
 * 設計上の重要な点：
 * - RootLayoutのAuthProviderをオーバーライドして、サーバー取得済みのユーザー情報を提供
 * - HeaderAuthenticatedにサーバーユーザー情報を直接渡すことで、初回レンダリングから完全なUIを表示
 * - これにより、初回レンダリング時のレイアウトシフト(CLS)やFOUCを回避
 * - HeaderAuthenticatedは このレイアウト で提供される
 * - Background、Footerは RootLayout で提供される
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

  // 認証チェック成功 → サーバー取得済みのユーザー情報をAuthProviderとHeaderに渡す
  return (
    <AuthProvider initialStatus="authenticated" initialUser={result.user}>
      <HeaderAuthenticated user={result.user} />
      {children}
    </AuthProvider>
  );
}
