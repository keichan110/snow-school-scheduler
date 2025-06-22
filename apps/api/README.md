# Snow School Scheduler API

スキー・スノーボードスクールのシフト管理システム - バックエンドAPI

## 概要

Cloudflare Workers + Hono + Prisma を使用したREST APIサーバー。全テーブル対応の完全CRUD機能を提供。

## 技術スタック

- **ランタイム**: Cloudflare Workers
- **フレームワーク**: Hono
- **ORM**: Prisma
- **データベース**: Cloudflare D1 (SQLite)
- **言語**: TypeScript

## データモデル

実際のスキー・スノーボードスクール運営に最適化されたデータ構造：

### 主要テーブル
- **Department**: 部門管理（スキー・スノーボード）
- **Certification**: 資格マスタ（SAJ・JSBA等の各種資格）
- **Instructor**: インストラクター管理（個人情報・ステータス）
- **InstructorCertification**: インストラクター資格関連
- **ShiftType**: シフト種類マスタ（レッスン・検定・県連事業等）
- **Shift**: シフト枠（日付・部門・必要人数）
- **ShiftAssignment**: インストラクター割り当て

### リレーション
- 部門 ← 資格・シフト
- インストラクター ← 資格関連・シフト割り当て
- シフト ← 割り当て（部門・シフト種類）

## APIエンドポイント

### 基本エンドポイント
- `GET /` - API情報とエンドポイント一覧
- `GET /health` - ヘルスチェック

### 部門管理 (`/api/departments`)
- `GET /api/departments` - 部門一覧取得
- `GET /api/departments/:id` - 部門詳細取得
- `POST /api/departments` - 部門作成
- `PUT /api/departments/:id` - 部門更新
- `DELETE /api/departments/:id` - 部門削除

### 資格管理 (`/api/certifications`)
- `GET /api/certifications` - 資格一覧取得
- `GET /api/certifications/:id` - 資格詳細取得
- `POST /api/certifications` - 資格作成
- `PUT /api/certifications/:id` - 資格更新
- `DELETE /api/certifications/:id` - 資格削除

### インストラクター管理 (`/api/instructors`)
- `GET /api/instructors` - インストラクター一覧取得
  - クエリパラメータ: `status` (ACTIVE/INACTIVE/RETIRED)
- `GET /api/instructors/:id` - インストラクター詳細取得
- `POST /api/instructors` - インストラクター作成（バリデーション付き）
- `PUT /api/instructors/:id` - インストラクター更新
- `DELETE /api/instructors/:id` - インストラクター削除

### インストラクター資格関連 (`/api/instructor-certifications`)
- `GET /api/instructor-certifications` - 資格関連一覧取得
- `GET /api/instructor-certifications/:id` - 資格関連詳細取得
- `POST /api/instructor-certifications` - 資格関連作成
- `PUT /api/instructor-certifications/:id` - 資格関連更新
- `DELETE /api/instructor-certifications/:id` - 資格関連削除

### シフト種類管理 (`/api/shift-types`)
- `GET /api/shift-types` - シフト種類一覧取得
- `GET /api/shift-types/:id` - シフト種類詳細取得
- `POST /api/shift-types` - シフト種類作成
- `PUT /api/shift-types/:id` - シフト種類更新
- `DELETE /api/shift-types/:id` - シフト種類削除

### シフト管理 (`/api/shifts`)
- `GET /api/shifts` - シフト一覧取得
  - クエリパラメータ: `departmentId`, `shiftTypeId`, `dateFrom`, `dateTo`
- `GET /api/shifts/:id` - シフト詳細取得（割り当て統計付き）
- `POST /api/shifts` - シフト作成（バリデーション付き）
- `PUT /api/shifts/:id` - シフト更新
- `DELETE /api/shifts/:id` - シフト削除

### シフト割り当て管理 (`/api/shifts/:id/assign`)
- `GET /api/shifts/:id/assign` - 特定シフトの割り当て状況取得
- `PUT /api/shifts/:id/assign` - シフト割り当て一括更新
  - リクエストボディ: `{ "instructorIds": ["uuid1", "uuid2", "uuid3"] }`
  - 機能: 指定されたインストラクターID配列でシフト割り当てを完全置換
  - 自動処理: 追加・削除を同時実行、重複チェック、定員チェック

## API機能の特徴

### データ取得
- **リレーション対応**: 関連データを含めた取得が可能
- **統計情報**: シフトの割り当て状況等の計算済み情報
- **フィルタリング**: クエリパラメータによる絞り込み機能
- **ソート**: 適切な順序での結果返却

### データ操作
- **バリデーション**: Hono validator による入力データ検証
- **重複チェック**: 同一シフトへの重複割り当て防止
- **一括割り当て**: インストラクター配列による効率的な割り当て更新
- **カスケード削除**: 関連データの整合性保持

### エラーハンドリング
- **統一されたエラーレスポンス**: 一貫したエラー形式
- **適切なHTTPステータスコード**: RESTful な設計
- **詳細なエラーメッセージ**: デバッグしやすい情報提供

### その他
- **CORS対応**: フロントエンドからのアクセス対応
- **型安全性**: TypeScript による完全な型定義

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# TypeScriptコンパイル
npm run build

# Cloudflare Workersにデプロイ
npm run deploy

# 型チェック
npm run typecheck

# リンティング
npm run lint
```

## Prisma操作

```bash
# マイグレーション適用（開発環境）
npx prisma migrate dev

# Prismaクライアント生成
npx prisma generate

# Prisma Studio起動
npx prisma studio
```

## レスポンス形式

### 成功レスポンス

```json
{
  "success": true,
  "data": {...},
  "message": "操作成功メッセージ"
}
```

### エラーレスポンス

```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

### シフト統計情報

```json
{
  ...shiftData,
  "assignedCount": 3,
  "remainingCount": 2,
  "isFullyAssigned": false
}
```

### 一括割り当てレスポンス

```json
{
  "success": true,
  "data": {
    "added": ["uuid1"],
    "removed": ["uuid4"],
    "unchanged": ["uuid2", "uuid3"],
    "current": ["uuid1", "uuid2", "uuid3"],
    "assignments": [...],
    "assignedCount": 3,
    "remainingCount": 0,
    "isFullyAssigned": true
  },
  "message": "Shift assignments updated successfully"
}
```

## 環境設定

### 必要な環境変数 (.env)

- `DATABASE_URL`: ローカル開発用SQLiteファイルパス
- `CLOUDFLARE_D1_TOKEN`: Cloudflare APIトークン
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflareアカウント ID
- `CLOUDFLARE_DATABASE_ID`: D1データベース ID

### Cloudflare設定 (wrangler.toml)

- 開発環境: `snow-school-scheduler-api-dev`
- 本番環境: `snow-school-scheduler-api`