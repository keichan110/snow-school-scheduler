"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

// ログアウト後のリダイレクト遅延時間（ミリ秒）
const LOGOUT_REDIRECT_DELAY = 500;

/**
 * ログアウト専用ページ
 *
 * このページの目的：
 * 1. 保護されたページから離れた場所でログアウト処理を実行
 * 2. ProtectedRouteの干渉を受けずに安全にログアウト
 * 3. ログアウト完了後にホームページにリダイレクト
 *
 * フロー：
 * 保護されたページ → /logout → ログアウト実行 → / (ホーム)
 */
export default function LogoutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    // ページがマウントされたら即座にログアウト処理を開始
    const performLogout = async () => {
      try {
        // ログアウト処理を実行（API呼び出し + 状態クリア）
        await logout();

        // 少し待ってからホームページにリダイレクト
        // この遅延により、状態の更新が確実に完了
        setTimeout(() => {
          window.location.href = "/";
        }, LOGOUT_REDIRECT_DELAY);
      } catch {
        // エラーが発生してもホームページにリダイレクト
        setTimeout(() => {
          window.location.href = "/";
        }, LOGOUT_REDIRECT_DELAY);
      }
    };

    performLogout();
  }, [logout]);

  return (
    <div className="flex h-[calc(100vh-16rem)] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-blue-600 border-b-2" />
        <h2 className="mb-2 font-semibold text-gray-800 text-xl">
          ログアウト中...
        </h2>
        <p className="text-gray-600">少々お待ちください</p>
      </div>
    </div>
  );
}
