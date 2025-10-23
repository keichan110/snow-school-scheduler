import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import Footer from "@/app/_components/layout/footer";
import Header from "@/app/_components/layout/header";
import { AuthProvider } from "@/contexts/auth-context";
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
 * 3. 認証済みユーザー情報を AuthProvider に渡してクライアント側で利用可能にする
 * 4. Header と Footer を含む共通UIレイアウトを提供
 *
 * 設計上の重要な点：
 * - AuthProvider はこのレイアウトで一度だけ配置される（二重ラップ防止）
 * - Header が参照する useAuth() はこの AuthProvider を指す
 * - 子コンポーネントの logout() や updateDisplayName() は Header にも反映される
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
  // この AuthProvider が保護ルート全体で唯一のインスタンスとなる
  return (
    <AuthProvider initialStatus="authenticated" initialUser={user}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-32 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
