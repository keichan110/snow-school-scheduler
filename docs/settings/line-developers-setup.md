# LINE Developers 設定マニュアル

## 目次

- [概要](#概要)
- [前提条件](#前提条件)
- [LINE Developers Console設定](#line-developers-console設定)
  - [1. LINE Developers Console アクセス](#1-line-developers-console-アクセス)
  - [2. プロバイダー作成](#2-プロバイダー作成)
  - [3. LINE Loginチャンネル作成](#3-line-loginチャンネル作成)
  - [4. チャンネル基本設定の構成](#4-チャンネル基本設定の構成)
  - [5. 環境変数設定](#5-環境変数設定)
  - [6. 設定検証](#6-設定検証)
- [ファーストアドミン設定](#ファーストアドミン設定)
  - [開発環境でのファーストアドミン設定](#開発環境でのファーストアドミン設定)
  - [本番環境でのファーストアドミン設定](#本番環境でのファーストアドミン設定)
  - [セキュリティ考慮事項](#セキュリティ考慮事項-1)
- [トラブルシューティング](#トラブルシューティング)
- [セキュリティ注意事項](#セキュリティ注意事項)
- [メンテナンス](#メンテナンス)
- [関連リンク](#関連リンク)

## 概要

スキースクール管理システムのLINE認証機能を有効化するためのLINE Developers Console設定手順。

## 前提条件

- LINE個人アカウント（LINEアプリでログイン可能）
- システム管理者権限
- 本番環境のドメイン情報（Cloudflare Pages等）

## LINE Developers Console設定

### 1. LINE Developers Console アクセス

1. [LINE Developers Console](https://developers.line.biz/console/) にアクセス
2. LINEアカウントでログイン
3. 「Create」または「新規プロバイダー作成」をクリック

### 2. プロバイダー作成

1. **プロバイダー名**: `スキースクールシステム` (任意の名前)
2. **説明**: スキー・スノーボードスクールのシフト管理システム
3. 「Create」をクリック

### 3. LINE Loginチャンネル作成

1. 作成したプロバイダーを選択
2. 「Create a new channel」をクリック
3. **チャンネルタイプ**: `LINE Login` を選択

#### 基本情報入力

| 項目                        | 設定値                             | 備考                 |
| --------------------------- | ---------------------------------- | -------------------- |
| **チャンネル名**            | スキースクールシフト管理           | アプリ識別用         |
| **チャンネル説明**          | 内部スタッフ向けシフト管理システム | 50文字以内推奨       |
| **アプリタイプ**            | ウェブアプリ                       | 必須選択             |
| **メールアドレス**          | admin@your-domain.com              | 管理者メールアドレス |
| **プライバシーポリシーURL** | https://your-domain.com/privacy    | 後から設定可能       |
| **サービス利用規約URL**     | https://your-domain.com/terms      | 後から設定可能       |

4. 利用規約に同意して「Create」をクリック

### 4. チャンネル基本設定の構成

#### Channel ID と Channel Secret の取得

1. 作成されたチャンネルの「Basic settings」タブを選択
2. **Channel ID** をコピーして記録
3. **Channel secret** の「Issue」をクリックしてシークレットキーを生成・記録

#### Callback URL の設定

1. 「LINE Login」タブを選択
2. **Callback URL** に以下を追加：

```
開発環境用:
http://localhost:3000/api/auth/callback/line

本番環境用:
https://your-app.pages.dev/api/auth/callback/line
```

3. 「Update」をクリックして保存

#### スコープ設定

**必須スコープ**:

- ☑️ `profile` - ユーザープロフィール情報取得
- ☑️ `openid` - OpenID Connect対応

**オプション**:

- ☐ `email` - メールアドレス（不要）

### 5. 環境変数設定

取得した情報を `.env.local` に設定：

```bash
# LINE認証設定
LINE_CHANNEL_ID=1234567890          # 取得したChannel ID
LINE_CHANNEL_SECRET=abcdef123456789  # 取得したChannel Secret

# コールバックURL（環境に応じて変更）
NEXTAUTH_URL=http://localhost:3000   # 開発環境
# NEXTAUTH_URL=https://your-app.pages.dev  # 本番環境
```

### 6. 設定検証

#### 開発環境での確認

1. `npm run dev` でローカルサーバー起動
2. `http://localhost:3000/login` にアクセス
3. LINEログインボタンが表示されることを確認

#### 本番環境での確認

1. Cloudflare Pagesにデプロイ後
2. `https://your-app.pages.dev/login` にアクセス
3. LINE認証フローが正常に動作することを確認

## LINE認証のトラブルシューティング

### よくあるエラー

#### 1. `invalid_client` エラー

**症状**: LINE認証時にクライアント認証エラーが発生
```
原因: Channel IDまたはChannel Secretが間違っている
解決: .env.localの設定値を再確認
```

#### 2. `redirect_uri_mismatch` エラー

**症状**: 認証後のリダイレクトでエラーが発生
```
原因: Callback URLがLINE Developers Consoleの設定と一致しない
解決: 両方の設定を確認して統一する
```

#### 3. `unauthorized_client` エラー

**症状**: 認証リクエスト自体が拒否される
```
原因: チャンネル設定が不完全
解決: LINE LoginタブでスコープとコールバックURLを再設定
```

### デバッグ方法

#### ログ確認

```bash
# 開発環境でのLINE認証ログ確認
tail -f .next/server.log | grep "line"
```

#### 設定確認

```bash
# 環境変数が正しく読み込まれているか確認
node -e "console.log(process.env.LINE_CHANNEL_ID)"
```

## セキュリティ注意事項

### Channel Secret の取り扱い

⚠️ **重要**: Channel Secret は絶対に公開リポジトリにコミットしないでください

- `.env.local` ファイルを `.gitignore` に追加済み
- 本番環境ではCloudflare Pagesの環境変数に設定
- チーム内でのSecret共有はセキュアな方法で実施

### 本番環境設定時の追加セキュリティ

1. **HTTPS必須**: 本番環境では必ずHTTPS通信を使用
2. **ドメイン制限**: 信頼できるドメインのみCallback URLに設定
3. **定期的なSecret更新**: 3-6ヶ月毎にChannel Secretを再生成推奨

## メンテナンス

### 定期確認項目

- [ ] Channel Secretの有効期限確認（6ヶ月毎）
- [ ] Callback URLの正確性確認（環境変更時）
- [ ] 利用統計の確認（月次）
- [ ] プライバシーポリシー/利用規約の更新（年次）

## ファーストアドミン設定

### 概要

システム初回導入時に必要なファーストアドミンユーザーの設定手順。LINE認証後にシステム管理者権限を付与する。

### 開発環境でのファーストアドミン設定

#### 1. LINE認証の完了確認

1. `npm run dev` でローカルサーバー起動
2. `http://localhost:3000/login` にアクセス
3. LINE認証を完了してユーザー情報を確認

#### 2. データベースでのロール設定

```bash
# Prisma Studioを起動
npm run db:studio

# ブラウザでPrisma Studio（http://localhost:5555）にアクセス
# 1. "User" テーブルを選択
# 2. LINE認証で作成されたユーザーレコードを確認
# 3. 該当ユーザーの "role" フィールドを "ADMIN" に変更
# 4. "Save changes" で保存
```

#### 3. 設定確認

1. ブラウザでアプリケーションにアクセス
2. LINE認証でログイン
3. 管理者メニュー（`/admin`）にアクセス可能であることを確認

### 本番環境でのファーストアドミン設定

#### 1. デプロイ後の認証確認

1. 本番環境URL（`https://your-app.pages.dev/login`）にアクセス
2. LINE認証を完了してユーザー情報を確認

#### 2. データベースアクセス設定

**Cloudflare Pages + D1の場合**:

```bash
# Cloudflare CLI でデータベースアクセス
npx wrangler d1 execute YOUR_DB_NAME --command="SELECT * FROM User;"

# 管理者権限付与
npx wrangler d1 execute YOUR_DB_NAME --command="UPDATE User SET role = 'ADMIN' WHERE id = 'USER_ID_HERE';"
```

**外部データベース（PostgreSQL等）の場合**:

```bash
# データベース接続
psql -h your-db-host -U your-username -d your-database

# ユーザー確認
SELECT id, name, email, role FROM "User";

# 管理者権限付与
UPDATE "User" SET role = 'ADMIN' WHERE id = 'USER_ID_HERE';
```

#### 3. 本番環境での確認

1. 本番環境でLINE認証ログイン
2. 管理者メニュー（`/admin`）にアクセス可能であることを確認
3. 各管理機能が正常に動作することをテスト

### セキュリティ考慮事項

#### ファーストアドミン設定時の注意事項

⚠️ **重要**: 本番環境でのデータベース操作は慎重に実行してください

- **事前バックアップ**: 重要なデータベース操作前は必ずバックアップを取得
- **ユーザーID確認**: 正しいユーザーIDに権限を付与することを慎重に確認
- **アクセスログ**: 管理者権限付与の記録を残す
- **セキュアアクセス**: データベースへの直接アクセスはVPN経由等のセキュアな方法で実施

#### 追加管理者の設定

1. ファーストアドミンでシステムにログイン
2. 管理者メニュー > ユーザー管理 から新規管理者を追加
3. 直接データベース操作ではなく、システム経由での権限付与を推奨

### ファーストアドミン設定のトラブルシューティング

#### よくある問題

#### 1. 管理者メニューにアクセスできない

**症状**: LINE認証後に`/admin`ページでアクセス拒否される
```
原因: roleが正しく設定されていない
解決: データベースでrole設定を再確認
```

#### 2. 本番環境でデータベースにアクセスできない

**症状**: 本番環境でデータベース操作コマンドが失敗する
```
原因: データベース接続設定やアクセス権限の問題
解決: 環境変数とデータベース設定を確認
```

#### 3. 複数ユーザーが同じメールアドレスで作成される

**症状**: 同一LINEアカウントで複数のユーザーレコードが存在する
```
原因: LINEアカウントの重複登録
解決: 重複レコードを削除し、正しいユーザーに権限を付与
```

## 関連リンク

- [LINE Developers Console](https://developers.line.biz/console/)
- [LINE Login API Reference](https://developers.line.biz/en/reference/line-login/)
- [OpenID Connect specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [Next.js Authentication (NextAuth.js)](https://next-auth.js.org/)

---

## 更新履歴

| 日付 | 更新内容 | 担当者 |
|------|----------|--------|
| 2024-XX-XX | 初版作成（LINE Developers Console設定手順） | - |
| 2024-XX-XX | ファーストアドミン設定手順を追加 | - |

> **注意**: 設定変更時は本マニュアルを必ず更新してください
