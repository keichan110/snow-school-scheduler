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

### バックエンド API
- 部門管理（スキー・スノーボード）
- 資格マスタ管理（SAJ・JSBA等）
- インストラクター管理
- シフト管理・一括割り当て機能
- 完全なREST API（全CRUD操作対応）

### フロントエンド（実装予定）
- 管理画面UI
- シフト表示（カレンダー形式）
- 割り当て操作機能

## 詳細ドキュメント

- [OpenAPI仕様書](./docs/api/openapi.yaml)
- [バックエンドAPI詳細](./apps/api/README.md)
- [CLAUDE.md](./CLAUDE.md) - 開発ガイダンス