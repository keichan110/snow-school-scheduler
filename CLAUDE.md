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

## 開発フロー

1. ユーザーからの要求を正確に理解し、 不明な点を完全に無くし、**実行計画書を z/plan.md に作成**する
   1. 既に z/plan.md が存在する場合は初期化する
   1. 不具合が発生している場合は root-cause-analyzer によって原因の追求をする
2. ユーザーの承認を受け、承認を得たら z/todo.md に TODO リストを作成する。**承認を受けるまで次には進まない**。
   1. 既に z/todo.md が存在する場合は初期化する
3. 実装にあたり以下の担当で実装する
   1. バックエンド処理の変更は backend-engineer が実装をする
   2. フロントエンドは frontend-ui-ux-expert が実装をする
   3. DB に変わる箇所は sql-bigquery-analyst が DB の指示を仰ぐ
4. typecheck と lint を実行し解決するまで繰り返す
5. strict-code-reviewer に**コードレビューを必ず受ける**
   1. Critical な点は必ず修正する
6. 実装が完了したら TODO リストにチェックをつける
