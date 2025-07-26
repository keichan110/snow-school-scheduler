# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

スキー・スノーボードスクールのシフト管理システム。

## 技術スタック

- **バックエンド/フロントエンド**: Next.JS 15.4 + Cloudflare Workers
- **データベース**: Prisma ORM 6.12 + Cloudflare D1 (SQLite)
- **スタイリング**: Tailwind CSS 4.1
- **開発ツール**: TypeScript 5.8, ESLint 9.31, Wrangler 4.25

## コードスタイル・規約

./docs/nextjs.md に従って実装して下さい

## 開発ワークフロー

**IMPORTANT**: 作業前に必ず以下の手順を実行：

1. `npm run typecheck` - TypeScript エラーチェック
2. `npm run lint` - ESLint による静的解析
3. 変更後は再度型チェックとリントを実行

### 設計・実装フロー

- **設計時**: `z/plan.md` ファイルを作成（既存の場合は内容を初期化）して作業内容を記載し、承認を得てから作業を開始
- **実装時**: `z/todo.md` ファイルを作成（既存の場合は内容を初期化）してTODOリストを作成し、ステップ毎にチェックして進行

### Git コミット規約

**YOU MUST** use Gitmoji for all commit messages:
