export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            スキー・スノーボードスクール
          </h1>
          <h2 className="text-2xl text-muted-foreground mb-8">
            シフト管理システム
          </h2>
          <p className="text-lg text-foreground/80 mb-12">
            インストラクターの管理からシフト割り当てまでの一連の業務を効率化します
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="bg-card p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">シフト一覧</h3>
              <p className="text-muted-foreground">
                週間・月間表示でシフトを確認
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">管理者機能</h3>
              <p className="text-muted-foreground">
                シフト作成・インストラクター管理
              </p>
            </div>
          </div>
        </div>
    </div>
  )
}