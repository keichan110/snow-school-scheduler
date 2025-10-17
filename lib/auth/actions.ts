"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * ログアウト Server Action
 *
 * このアクションの役割：
 * 1. サーバー側で認証Cookieを削除
 * 2. ルートページへリダイレクト（→ /login へ自動遷移）
 *
 * 使用方法：
 * - クライアントコンポーネントから `await logoutAction()` で呼び出し
 * - redirect() の呼び出しにより、呼び出し元でエラーがスローされる（Next.js の仕様）
 */
export async function logoutAction() {
  try {
    const cookieStore = cookies();

    // 認証関連のCookieを削除
    cookieStore.delete("auth-token");
    cookieStore.delete("auth-session");
  } catch {
    // エラーが発生してもリダイレクトは続行
  }

  // ルートページにリダイレクト
  // ルートページは未認証ユーザーを /login へリダイレクトする
  redirect("/");
}
