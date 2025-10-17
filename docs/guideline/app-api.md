# /app/api ガイド（GET 専用・内部API）

## 方針
- **GET 専用**。読み取りデータを提供する内部 API。
- **POST/PUT/PATCH/DELETE は使用しない**（更新は **Server Actions** で実装）。
- 例外：Webhook/OAuth コールバック等、**URL で受ける必要がある**もののみ API Route を使用可。

## 「内部API」の定義
- **呼び出し元**: サーバーコンポーネント（RSC）、クライアントコンポーネント（CSR）から使用
- **認証**: 必要に応じて `authenticateFromRequest()` でチェック（公開エンドポイントも含む）
- **外部公開**: 想定しない（CORS未設定、外部サービスからの直接呼び出しは例外ケースのみ）

## ルール
- `app/api/<name>/route.ts` に **GET** を実装。出力は **zod で検証**してから返す。
- レスポンス形は `{ success: true, data }` / `{ success: false, error }` を推奨。
- 認可が必要なら `cookies()`/ヘッダーでサーバー側チェック。

## 例（GET）
```ts
// app/api/todos/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

const Todo = z.object({ id: z.string(), title: z.string(), done: z.boolean() });
const TodoList = z.array(Todo);

const data = [{ id: '1', title: 'Learn Next', done: false }];

export async function GET() {
  return NextResponse.json({ success: true, data: TodoList.parse(data) });
}
```
