/**
 * ダッシュボードページ
 *
 * このページの役割：
 * - 認証済みユーザー（MEMBER以上）のホームページ
 * - システムの概要情報を一目で確認できる画面
 * - 親レイアウト (member)/layout.tsx で認証済み
 *
 * URL: /
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground">
          スキー・スノーボードスクール シフト管理システム
        </p>
      </div>
    </div>
  );
}
