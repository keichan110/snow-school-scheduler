import { redirect } from "next/navigation";
import { authenticateFromCookies } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

/**
 * ルートページ
 *
 * このページの役割：
 * 1. 認証済みユーザーを `/shifts` へリダイレクト
 * 2. 未認証ユーザーを `/login` へリダイレクト
 * 3. サーバーサイドでリダイレクト判定を完結させることで、
 *    クライアント側のローディング中チラつきを防ぐ
 *
 * サーバーコンポーネントとして実装：
 * - `authenticateFromCookies()` でサーバー側認証チェック
 * - `redirect()` による即座のサーバーサイドリダイレクト
 * - `dynamic = "force-dynamic"` で認証状態の変化を即座に反映
 */
export default async function Page() {
  // サーバー側で認証状態をチェック
  const authResult = await authenticateFromCookies();

  // 認証済みユーザーは `/shifts` へリダイレクト
  if (authResult.success && authResult.user) {
    redirect("/shifts");
  }

  // 未認証ユーザーは `/login` へリダイレクト
  redirect("/login");
}
