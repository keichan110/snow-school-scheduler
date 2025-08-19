# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

スキー・スノーボードスクールのシフト管理システム。インストラクター管理、シフト作成・割り当て、公開シフト表示機能を提供するWebアプリケーション。

## 技術スタック

- **フレームワーク**: Next.js 15.1 (App Router)
- **言語**: TypeScript 5.7 (厳格設定)
- **データベース**: Prisma ORM 6.2 + SQLite
- **スタイリング**: Tailwind CSS 3.4 + shadcn/ui
- **開発ツール**: ESLint 9.17, Prettier 3.6, Jest 29.7
- **状態管理**: TanStack Query 5.85
- **その他**: Radix UI, Zod, date-fns

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
npm test             # Jest単体テスト
npm run test:watch   # テストwatchモード
```

### データベース操作

```bash
npm run db:generate  # Prismaクライアント生成（スキーマ変更時必須）
npm run db:push      # スキーマをDBに反映
npm run db:studio    # Prisma Studio起動
npm run db:seed      # サンプルデータ投入
```

## アーキテクチャ・設計原則

### Next.js App Router設計

- **Server Components優先**: デフォルトでServer Componentを使用
- **Client Component最小化**: `"use client"`は必要最小限に
- **ファイルベース規約**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`使用

### プロジェクト構造

```
app/
├── admin/           # 管理者機能（シフト管理、マスタ管理）
├── shifts/          # 公開シフト表示
├── api/             # API Routes
├── layout.tsx       # ルートレイアウト
└── page.tsx         # ホームページ

components/          # UIコンポーネント
shared/             # 共有ユーティリティ・型定義
features/           # 機能別モジュール
prisma/             # データベーススキーマ・シード
```

### データベース設計

- **Prisma ORM**: 型安全なDB操作
- **主要テーブル**: departments, instructors, certifications, shifts, shift_assignments
- **関係性**: 多対多関係（instructor-certification, shift-assignment）
- **制約**: ユニーク制約、カスケード削除、論理削除（isActiveフラグ）

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

- strict mode, noUncheckedIndexedAccess有効
- Zodバリデーション使用
- Server Actions型安全性確保

### コンポーネント設計

- Container-Presentationalパターン
- Server ComponentでデータフェッチングとClient Componentでインタラクション分離
- 並列データフェッチング（Promise.all）使用

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

- 環境変数適切管理（NEXT*PUBLIC*プレフィックス）
- Zodによる入力値バリデーション
- Prismaパラメータ化クエリ使用

### パフォーマンス

- Server Components活用
- 動的インポート（`dynamic()`）によるコード分割
- Next.js Imageコンポーネント使用
- 適切なキャッシュ戦略

## 重要な実装パターン

### API Routes型安全設計

```typescript
export type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };
```

### Server Actions実装

- try/catch適切エラーハンドリング
- revalidatePath()によるキャッシュ更新
- Zodバリデーション必須

### エラーハンドリング

- `error.tsx`ファイルによるエラー境界
- `not-found.tsx`によるNotFound処理
- 一貫したエラーレスポンス形式

この構成により、型安全性と開発効率を両立したモダンなNext.jsアプリケーションを構築している。
