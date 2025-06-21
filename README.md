# Snow School Scheduler

スキー・スノーボードスクールのシフト管理システム

## 技術スタック

- **モノレポ**: Turborepo
- **バックエンド**: Cloudflare Workers + Hono
- **データベース**: Cloudflare D1 + Prisma
- **フロントエンド**: Cloudflare Pages + Remix
- **スタイリング**: Tailwind CSS

## 開発環境のセットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. 環境変数の設定:
```bash
cp apps/api/.env.example apps/api/.env
```

3. データベースのセットアップ:
```bash
cd apps/api
npx prisma migrate dev
```

4. 開発サーバーの起動:
```bash
npm run dev
```

## プロジェクト構成

```
.
├── apps/
│   ├── api/          # Cloudflare Workers API (Hono)
│   └── web/          # Cloudflare Pages Web App (Remix)
└── packages/
    └── typescript-config/  # 共通TypeScript設定
```

## 主要機能

- ユーザー管理（管理者、マネージャー、インストラクター）
- シフト管理（作成、割り当て、ステータス管理）
- スキルレベル別クラス管理
- シフト割り当て管理