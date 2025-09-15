import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ログイン - スキー・スノーボードスクール シフト管理システム',
  description: 'LINE認証でログインして、シフト管理システムをご利用ください。',
};

/**
 * 認証ページ用レイアウト
 * ログイン・エラーページなどの認証関連ページで使用
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* 背景グラデーション */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
