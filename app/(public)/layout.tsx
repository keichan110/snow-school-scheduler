import type { ReactNode } from "react";

/**
 * 公開ページレイアウト
 * 認証不要のページグループに適用
 * ガード処理を行わず、子要素をそのまま描画する透過レイアウト
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
