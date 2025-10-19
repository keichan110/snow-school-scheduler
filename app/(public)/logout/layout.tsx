import type { ReactNode } from "react";

import { AuthProvider } from "@/contexts/auth-context";

/**
 * ログアウトページ専用レイアウト
 *
 * このレイアウトの役割：
 * 1. ログアウトページのみに AuthProvider を提供
 * 2. logout-action-client.tsx が useAuth() を呼び出せるようにする
 * 3. クライアント側の認証状態をクリアするために必要
 *
 * 設計上の重要な点：
 * - ログアウトページは公開ルート配下だが、AuthContext を必須とする唯一の箇所
 * - initialUser/initialStatus を渡さず、AuthProvider にクライアント側でフェッチさせる
 * - ログアウト処理中に認証状態を参照・更新する必要があるため AuthProvider が必須
 */
export default function LogoutLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
