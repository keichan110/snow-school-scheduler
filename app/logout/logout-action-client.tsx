"use client";

import { useEffect } from "react";
import { logoutAction } from "@/lib/auth/actions";

/**
 * ログアウトアクション実行クライアントコンポーネント
 *
 * このコンポーネントの役割：
 * 1. マウント時に Server Action（logoutAction）を呼び出し
 * 2. ログアウト処理中のスピナーUIを表示
 * 3. Server Action内の redirect() により自動的にリダイレクト
 *
 * 注意：
 * - Server Action内で redirect() が呼ばれるとエラーとしてキャッチされる
 * - これは Next.js の仕様であり、正常な挙動
 */
export default function LogoutActionClient() {
  useEffect(() => {
    const performLogout = async () => {
      try {
        await logoutAction();
      } catch {
        // Server Action内でredirectが呼ばれるとエラーとしてキャッチされる
        // これは正常な挙動なので、何もしない
      }
    };

    performLogout();
  }, []);

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
