# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

スキー・スノーボードスクールのシフト管理システム。Turborepo によるモノレポ構成で、Cloudflare スタックをベースとしたフルスタック Web アプリケーション。

## 技術スタック

- **モノレポ**: Turborepo
- **バックエンド**: Cloudflare Workers + Hono
- **データベース**: Cloudflare D1 + Prisma ORM
- **フロントエンド**: Cloudflare Pages + Remix
- **スタイリング**: Tailwind CSS

## アーキテクチャ

### モノレポ構成

```
apps/
├── api/          # Cloudflare Workers API (Hono)
├── web/          # Cloudflare Pages Web App (Remix)
packages/
└── typescript-config/  # 共通TypeScript設定
```

### データモデル

**IMPORTANT**: システムは実際には以下の 3 つの主要エンティティで構成されています：

- **Certification**: 資格マスタ管理
- **Instructor**: インストラクター管理
- **Shift**: シフト管理

詳細は `apps/api/prisma/schema.prisma` を確認してください。

## 開発コマンド

### 全体

```bash
npm install                 # 依存関係のインストール
npm run dev                 # 開発サーバー起動（全アプリ）
npm run build              # 全アプリのビルド
npm run typecheck          # 型チェック（全アプリ）
npm run lint               # リンティング（全アプリ）
npm run clean              # ビルドキャッシュのクリア
```

### バックエンド（API）

```bash
cd apps/api
npm run dev                # Wrangler開発サーバー起動
npm run build              # TypeScriptコンパイル
npm run deploy             # Cloudflare Workersにデプロイ
npm run typecheck          # 型チェック
npm run lint               # ESLintでのリンティング

# Prisma関連
npx prisma migrate dev     # マイグレーション適用（開発環境）
npx prisma generate        # Prismaクライアント生成
npx prisma studio          # Prisma Studio起動
```

### フロントエンド（Web）

```bash
cd apps/web
npm run dev                # Remix開発サーバー起動
npm run build              # Remix + Viteビルド
npm run preview            # Wrangler Pagesプレビュー
npm run typecheck          # 型チェック
npm run lint               # ESLintでのリンティング
```

## コードスタイル・規約

**YOU MUST** follow these guidelines when working with this codebase:

- **TypeScript**: 必須。`any` の使用は避ける
- **ES モジュール**: import/export 構文を使用
- **関数型スタイル**: 可能な限り関数型プログラミングのパターンを採用
- **分割代入**: インポート時は分割代入を使用
- **コメント**: コード内コメントは必要最小限に（コードが自己説明的であること）

### ファイル構成

- API ルート: `apps/api/src/` 以下に Hono ルート定義
- Web ページ: `apps/web/app/routes/` 以下に Remix ルート定義
- 共通型定義: 必要に応じて `packages/` 以下に作成

## 開発ワークフロー

**IMPORTANT**: 作業前に必ず以下の手順を実行：

1. `npm run typecheck` - TypeScript エラーチェック
2. `npm run lint` - ESLint による静的解析
3. 変更後は再度型チェックとリントを実行

### Git コミット規約

**YOU MUST** use Gitmoji for all commit messages:

```bash
# 例：新機能追加
git commit -m "✨ ユーザー登録機能を追加"

# 例：バグ修正
git commit -m "🐛 シフト割り当てのバリデーションエラーを修正"

# 例：リファクタリング
git commit -m "♻️ API ルートの構造を整理"
```

よく使用するGitmoji：
- ✨ `:sparkles:` - 新機能
- 🐛 `:bug:` - バグ修正
- 📝 `:memo:` - ドキュメント
- ♻️ `:recycle:` - リファクタリング
- 🎨 `:art:` - コード構造/フォーマット改善
- ⚡️ `:zap:` - パフォーマンス改善
- 🔧 `:wrench:` - 設定ファイル
- 🚀 `:rocket:` - デプロイ

### 単一パッケージでの作業

```bash
# API のみ開発する場合
cd apps/api && npm run dev

# Web のみ開発する場合
cd apps/web && npm run dev
```

## 環境設定

### 初回セットアップ

1. 環境変数ファイルの作成: `cp apps/api/.env.example apps/api/.env`
2. Cloudflare D1 データベースの作成と ID 設定
3. データベースマイグレーション: `cd apps/api && npx prisma migrate dev`

### 必要な環境変数（apps/api/.env）

- `DATABASE_URL`: ローカル開発用 SQLite ファイルパス
- `CLOUDFLARE_D1_TOKEN`: Cloudflare API トークン
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare アカウント ID
- `CLOUDFLARE_DATABASE_ID`: D1 データベース ID

## デプロイメント

### API デプロイ

Cloudflare Workers へのデプロイは `wrangler.toml` の設定に基づく：

- 開発環境: `snow-school-scheduler-api-dev`
- 本番環境: `snow-school-scheduler-api`

### Web デプロイ

Cloudflare Pages へのデプロイ。ビルド出力は `build/` ディレクトリ。

## トラブルシューティング

### よくある問題

**Wrangler バージョン警告**

- 開発サーバー起動時に表示されるバージョン警告は無視可能
- 必要に応じて `npm install --save-dev wrangler@latest` で更新

**Remix 将来フラグ警告**

- `v3_lazyRouteDiscovery` や `v3_singleFetch` の警告は既知の問題
- 動作に影響なし

**ポート競合**

- API: デフォルトポート 65120（Wrangler が自動割り当て）
- Web: デフォルトポート 5173（競合時は 5174 など自動変更）

### データベース関連

**マイグレーション失敗**

```bash
cd apps/api
npx prisma migrate reset  # 開発環境のみ
npx prisma migrate dev
```

**Prisma クライアント生成エラー**

```bash
cd apps/api
npx prisma generate
```

## 主要機能

**IMPORTANT**: 実装予定の機能（現在は基本枠組みのみ）

- **シフト確認機能**: シフトの確認が可能
- **管理機能**:
  - **資格マスタ管理**: 資格制度の変更により廃止になった資格や追加になった資格を管理
  - **インストラクター管理**: インストラクターの追加、停止・資格情報の管理
  - **シフト管理**: インストラクターへのシフト割り当て

## 参考ドキュメント

### 公式ドキュメント

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Hono Documentation](https://hono.dev/)
- [Remix Documentation](https://remix.run/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### 外部参考資料

<!-- ここに外部のサイトや記事のリンクを追加 -->
