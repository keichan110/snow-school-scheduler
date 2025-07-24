# Snow School Scheduler

スキー・スノーボードスクールのシフト管理システム

## 技術スタック

- **フレームワーク**: Next.js 15.1 (App Router)
- **データベース**: Prisma ORM 6.2 + SQLite
- **スタイリング**: Tailwind CSS 3.4
- **開発ツール**: TypeScript 5.7, ESLint 9.17
- **テスト**: Jest 29.7 + Testing Library

## 開発環境のセットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. データベースのセットアップ:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

3. 開発サーバーの起動:
```bash
npm run dev
```

## プロジェクト構成

```
.
├── app/              # Next.js App Router
│   ├── api/          # API Routes
│   │   ├── departments/
│   │   ├── instructors/ 
│   │   ├── certifications/
│   │   ├── shifts/
│   │   └── health/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/       # React コンポーネント
├── lib/             # ユーティリティ・設定
├── prisma/          # データベーススキーマ・シード
└── docs/            # ドキュメント
```

## 主要機能

### API Routes (実装済み)
- ヘルスチェック（`/api/health`）
- 部門管理（`/api/departments`）
- 資格マスタ管理（`/api/certifications`）
- インストラクター管理（`/api/instructors`）
- シフト管理（`/api/shifts`）

### 開発用コマンド
```bash
# 型チェック
npm run typecheck

# リント実行
npm run lint

# テスト実行
npm run test
npm run test:watch

# データベース操作
npm run db:generate  # Prismaクライアント生成
npm run db:push      # スキーマをDBに反映
npm run db:studio    # Prisma Studio起動
npm run db:seed      # サンプルデータ投入
```

## 詳細ドキュメント

- [OpenAPI仕様書](./docs/openapi.yaml)
- [データベース設計](./docs/db.md)
- [開発ガイド](./docs/nextjs.md)
- [CLAUDE.md](./CLAUDE.md) - AI開発ガイダンス