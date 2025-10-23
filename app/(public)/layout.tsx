import type { ReactNode } from "react";

import Footer from "@/app/_components/layout/footer";

/**
 * 公開ページレイアウト
 *
 * このレイアウトの役割：
 * 1. 認証不要のページグループ（login, logout, terms, privacy等）に適用
 * 2. ガード処理を行わず、誰でもアクセス可能
 * 3. シンプルなUIレイアウトを提供（Header なし、Footer のみ）
 *
 * 設計上の重要な点：
 * - AuthProvider は配置しない（認証状態管理は不要）
 * - Header は表示しない（ログイン前のため）
 * - Footer のみ表示してブランドイメージを維持
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
