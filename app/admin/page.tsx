export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* ページタイトル */}
      <div className="rounded-lg bg-card p-8 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold text-foreground">管理者ダッシュボード</h1>
        <p className="text-muted-foreground">システムの各種管理機能にアクセスできます。</p>
      </div>

      {/* 管理機能メニュー */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AdminMenuCard
          title="シフト管理"
          description="シフトの作成・編集・割り当て管理"
          href="/admin/shifts"
          icon="📅"
        />

        <AdminMenuCard
          title="招待管理"
          description="新規メンバー招待URLの作成・管理"
          href="/admin/invitations"
          icon="🔗"
        />

        <AdminMenuCard
          title="ユーザー管理"
          description="システムユーザーの権限・状態管理"
          href="/admin/users"
          icon="👤"
        />
      </div>
    </div>
  );
}

interface AdminMenuCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
}

function AdminMenuCard({ title, description, href, icon }: AdminMenuCardProps) {
  return (
    <a
      href={href}
      className="group block rounded-lg border bg-card p-6 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
    >
      <div className="mb-4 text-3xl">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </a>
  );
}
