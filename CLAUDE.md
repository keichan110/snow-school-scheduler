# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

スキー・スノーボードスクールのシフト管理システム。インストラクター管理、シフト作成・割り当て、LINE認証によるユーザー管理、招待システム、公開シフト表示機能を提供するWebアプリケーション。

## 技術スタック

- **フレームワーク**: Next.js 15.1 (App Router)
- **言語**: TypeScript 5.7 (厳格設定)
- **Runtime要件**: Node.js >=22.0.0
- **データベース**: Prisma ORM 6.2 + SQLite
- **スタイリング**: Tailwind CSS 3.4 + shadcn/ui, Radix UI コンポーネント
- **開発ツール**: ESLint 9.17, Prettier 3.6, Jest 29.7
- **状態管理**: TanStack Query 5.85
- **UI拡張**: Vaul（drawer），React Day Picker，Lucide React（アイコン），Phosphor Icons
- **認証**: LINE Login API, jsonwebtoken
- **その他**: Zod（バリデーション），date-fns（日付操作），japanese-holidays, React Error Boundary

## 重要な開発コマンド

### 必須実行（作業前後）

```bash
npm run typecheck    # TypeScript型チェック（必須）
npm run lint         # ESLint静的解析（必須）
```

### 日常開発

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run start        # 本番モードで起動
npm test             # Jest単体テスト（全テスト実行）
npm run test:watch   # テストwatchモード
npm run test:coverage # カバレッジ付きテスト実行
npm run test:ci      # CI環境用テスト実行
npm run format       # Prettierコード整形
npm run format:check # 整形チェック
npm run test:validate # 型チェック+lint+テスト実行
```

### データベース操作

```bash
npm run db:generate  # Prismaクライアント生成（スキーマ変更時必須）
npm run db:push      # スキーマをDBに反映
npm run db:studio    # Prisma Studio起動
npm run db:seed      # サンプルデータ投入（tsx実行）
```

## アーキテクチャ・設計原則

### Next.js App Router設計

- **Server Components優先**: デフォルトでServer Componentを使用
- **Client Component最小化**: `"use client"`は必要最小限に
- **ファイルベース規約**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`使用

### プロジェクト構造

```
app/
├── (auth)/                   # 認証関連ページグループ
│   ├── signup/              # ユーザー登録
│   ├── error/               # 認証エラー
│   └── layout.tsx
├── auth/                    # 認証API・エラーページ
│   └── error/              
├── api/                     # API Routes (RESTful設計)
│   ├── auth/               # 認証関連API
│   │   ├── line/           # LINE認証（login, callback）
│   │   ├── users/          # ユーザー管理
│   │   ├── invitations/    # 招待システム
│   │   ├── me/             # 現在のユーザー情報
│   │   └── logout/         # ログアウト
│   ├── departments/[id]/   # 部門CRUD
│   ├── instructors/[id]/   # インストラクター CRUD
│   ├── certifications/[id]/ # 資格 CRUD
│   ├── shifts/[id]/        # シフト CRUD
│   ├── shift-types/[id]/   # シフト種別 CRUD
│   ├── health/             # ヘルスチェック
│   └── shifts/prepare/     # シフト作成準備データ
├── shifts/                 # 公開シフト表示機能
│   ├── components/         # シフト表示専用コンポーネント
│   ├── hooks/              # データ変換・ナビゲーション hooks
│   ├── utils/              # 週・月計算ユーティリティ
│   └── page.tsx
├── instructors/            # インストラクター管理
├── users/                  # ユーザー管理
├── certifications/         # 資格マスタ管理
├── shift-types/            # シフト種別マスタ管理
├── invitations/            # 招待管理
├── login/                  # ログインページ
├── logout/                 # ログアウトページ
├── privacy/                # プライバシーポリシー
├── terms/                  # 利用規約
├── layout.tsx              # ルートレイアウト（共通UI・Providers）
├── page.tsx                # ホームページ
└── globals.css             # グローバルスタイル

components/                   # 再利用可能UIコンポーネント（shadcn/ui拡張）
shared/                      # 共有ユーティリティ・型定義・ヘルパー
features/                    # 機能別モジュール（ドメイン駆動設計）
├── departments/             # 部門機能モジュール
├── instructors/             # インストラクター機能モジュール
├── shifts/                  # シフト機能モジュール
└── shared/                  # 機能間共有モジュール
hooks/                       # カスタムフック集
lib/                        # ライブラリ設定・ユーティリティ
prisma/                     # データベーススキーマ・シード・マイグレーション
public/                     # 静的アセット
docs/                       # プロジェクトドキュメント
```

### データベース設計

- **Prisma ORM**: 型安全なDB操作、クライアント生成を`generated/prisma`に配置
- **主要テーブル**: departments, instructors, certifications, shifts, shift_assignments, shift_types, users, invitation_tokens
- **認証テーブル**: users（LINE認証情報・権限管理）、invitation_tokens（招待URL管理）
- **関係性**: 多対多関係（instructor-certification, shift-assignment）
- **制約**: ユニーク制約、カスケード削除、論理削除（isActiveフラグ）
- **インデックス**: パフォーマンス最適化のための包括的インデックス設計
- **SQLite**: 開発・小規模運用向け軽量DB、Prisma Studioで可視化可能

## コーディング規約

### 命名規則

- **ファイル名**: kebab-case or PascalCase or camelCase
  - Reactコンポーネントは PascalCase (`UserProfile.tsx`)
  - カスタムフックは camelCase (`useUserProfile.ts`)
  - それ以外は kebab-case (`page.tsx`)
- **コンポーネント**: PascalCase (`UserProfile`)
- **カスタムフック**: camelCase (`useUserProfile`)
- **型定義**: PascalCase (`UserProfile`)
- **プロパティ**: camelCase (`userName`)
- **カスタムCSS**: kebab-case (`custom-button-style`)

### TypeScript厳格設定

- **Strict Mode**: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`有効
- **パス解決**: `@/*`エイリアス、`@prisma/client`は`generated/prisma`にマップ
- **プリセット**: Next.js推奨設定、ES2017ターゲット
- **Zodバリデーション**: API入力・出力の型安全性確保
- **Server Actions型安全性**: try/catch + revalidatePath パターン使用

### コンポーネント設計とパターン

- **Container-Presentationalパターン**: データ取得とUI表示を分離
- **Server/Client Component分離**: データフェッチングはServer、インタラクションはClient
- **並列データフェッチング**: Promise.allによる効率的なデータ取得
- **Features層アーキテクチャ**: ドメイン駆動でapi/handlers/services/types分離
- **Hooks活用**: TanStack Query（データ状態管理）、カスタムHooks（ロジック抽出）
- **shadcn/ui + Radix UI**: アクセシブルで再利用可能なコンポーネント基盤

## 開発ワークフロー

### 作業開始前（必須）

1. `npm run typecheck` - TypeScriptエラーチェック
2. `npm run lint` - ESLint静的解析

### データベーススキーマ変更時

1. `prisma/schema.prisma`編集
2. `npm run db:generate` - クライアント再生成
3. `npm run db:push` - スキーマ反映
4. `npm run typecheck` - 型チェック

### Git コミット規約

- **Gitmoji使用**: コミットメッセージにGitmojiを必須使用
- **英語命令形**: タイトルは英語で簡潔に
- **日本語詳細**: 本文で変更理由を日本語で説明

### 作業完了時チェックリスト

- [ ] `npm run typecheck && npm run lint` 成功
- [ ] 関連テスト通過確認
- [ ] Gitmojiコミットメッセージ作成
- [ ] Server/Client Component適切使い分け確認
- [ ] code-quality-reviewer によるコードレビューを実施

## セキュリティ・パフォーマンス

### セキュリティ

- **LINE認証**: LINE Login APIによる安全な認証システム
- **JWT管理**: jsonwebtokenによるセッション管理
- **招待システム**: 安全な招待URL生成・検証機能
- **環境変数管理**: NEXT_PUBLIC_プレフィックス適切使用
- **入力値バリデーション**: Zodによる型安全な入力検証
- **データベース**: Prismaパラメータ化クエリでSQLインジェクション防止
- **セキュリティヘッダー**: XSS、フレーミング攻撃防止ヘッダー設定

### パフォーマンス

- **Server Components活用**: デフォルトでSSR、必要時のみクライアントサイド
- **動的インポート**: dynamic()によるコード分割とバンドル最適化
- **画像最適化**: Next.js Imageコンポーネント使用（ただし unoptimized: true）
- **アイコン最適化**: Lucide React、Phosphor Iconsの効率的な読み込み
- **パッケージ最適化**: optimizePackageImportsでバンドルサイズ削減
- **TanStack Query**: 効率的なデータフェッチング・キャッシュ戦略
- **インデックス最適化**: データベースクエリの高速化

## 重要な実装パターン

### API Routes設計パターン

#### RESTful API設計

```typescript
// 統一レスポンス形式
export type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

// CRUD操作パターン
GET    /api/[resource]     → 一覧取得
POST   /api/[resource]     → 新規作成
GET    /api/[resource]/[id] → 詳細取得
PUT    /api/[resource]/[id] → 更新
DELETE /api/[resource]/[id] → 削除
```

#### 実装済みAPI エンドポイント

**基本リソースAPI**
- `/api/health` - ヘルスチェック
- `/api/departments` - 部門管理 (CRUD)
- `/api/instructors` - インストラクター管理 (CRUD)
- `/api/certifications` - 資格管理 (CRUD)
- `/api/shifts` - シフト管理 (CRUD)
- `/api/shift-types` - シフト種別管理 (CRUD)
- `/api/shifts/prepare` - シフト作成準備データ（特殊エンドポイント）

**認証・ユーザー管理API**
- `/api/auth/line/login` - LINE認証開始
- `/api/auth/line/callback` - LINE認証コールバック
- `/api/auth/me` - 現在のユーザー情報取得
- `/api/auth/logout` - ログアウト
- `/api/auth/users` - ユーザー管理 (CRUD)
- `/api/auth/invitations` - 招待システム管理
- `/api/auth/invitations/[token]` - 招待トークン処理
- `/api/auth/invitations/[token]/verify` - 招待トークン検証
- `/api/auth/invitations/active` - 有効な招待一覧

### Server Actions実装パターン

```typescript
// 標準的なServer Action実装パターン
export async function createResource(data: CreateResourceSchema) {
  try {
    const validated = createResourceSchema.parse(data);
    const result = await prisma.resource.create({ data: validated });
    revalidatePath('/admin/resources');
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: 'Failed to create resource' };
  }
}
```

### エラーハンドリング戦略

- **API Routes**: 統一されたApiResponse型でエラー情報を返却
- **Server Actions**: try/catch + revalidatePath() パターンで安全性確保
- **React Error Boundaries**: `error.tsx`ファイルによるエラー境界実装
- **404ハンドリング**: `not-found.tsx`による適切な404ページ表示
- **クライアントサイド**: TanStack Query + React Error Boundaryによる包括的エラー管理

## テストとコード品質

### Jest設定

- **テスト環境**: jsdom（React コンポーネントテスト）
- **設定ファイル**: `jest.config.js`（Next.js統合）、`jest.setup.js`
- **テストパターン**: `__tests__`フォルダ、`*.test.ts/tsx`、`*.spec.ts/tsx`
- **モックマッピング**: `@/*`エイリアス対応

### テスト実行戦略

```bash
npm test                    # 全テスト実行
npm run test:watch          # ウォッチモード（開発時推奨）
npm test -- --testPathPattern="shifts"  # 特定パス指定実行
```

### コード品質チェック

```bash
npm run typecheck && npm run lint  # 必須チェック（作業前後）
npm run format                     # コード整形実行
npm run format:check               # 整形チェックのみ
```

この構成により、型安全性・テスト担保・開発効率を三位一体で実現したモダンなNext.jsアプリケーションを構築している。
