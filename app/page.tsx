export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">スキー・スノーボードスクール</h1>
        <h2 className="mb-8 text-2xl text-muted-foreground">シフト管理システム</h2>
        <p className="mb-12 text-lg text-foreground/80">
          インストラクターの管理からシフト割り当てまでの一連の業務を効率化します
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-card p-6 shadow-md">
            <h3 className="mb-3 text-xl font-semibold">シフト一覧</h3>
            <p className="text-muted-foreground">週間・月間表示でシフトを確認</p>
          </div>
          <div className="rounded-lg bg-card p-6 shadow-md">
            <h3 className="mb-3 text-xl font-semibold">管理者機能</h3>
            <p className="text-muted-foreground">シフト作成・インストラクター管理</p>
          </div>
        </div>
      </div>
    </div>
  );
}
