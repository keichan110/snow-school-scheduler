'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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
      console.log('🚪 Starting logout process on dedicated logout page...');

      try {
        // ログアウト処理を実行（API呼び出し + 状態クリア）
        await logout();
        console.log('✅ Logout completed successfully');

        // 少し待ってからホームページにリダイレクト
        // この遅延により、状態の更新が確実に完了
        setTimeout(() => {
          console.log('🏠 Redirecting to home page...');
          window.location.href = '/';
        }, 500);
      } catch (_error) {
        console.error('❌ Logout failed');
        // エラーが発生してもホームページにリダイレクト
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      }
    };

    performLogout();
  }, [logout]);

  return (
    <div className="flex h-[calc(100vh-16rem)] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <h2 className="mb-2 text-xl font-semibold text-gray-800">ログアウト中...</h2>
        <p className="text-gray-600">少々お待ちください</p>
      </div>
    </div>
  );
}
