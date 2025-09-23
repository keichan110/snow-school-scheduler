# /app ガイド

## 責務
- ルーティングとレイアウトの起点（App Router）。
- **RSC による読み取り**のハブ。セグメントごとの `layout.tsx` で境界/責務を閉じる。
- `providers.tsx` で **QueryClientProvider** 等のクライアント・プロバイダを注入。

## ルール
- 読み取りは **`app/api`（GET） + RSC prefetch → `<Hydrate>`**。
- **更新は Server Actions**（`features/<name>/actions.ts`）を利用。CSR では `useMutation` で呼び出し or `<form action>`。
- `providers.tsx` は **Client Component**。`layout.tsx` から一度だけラップ。
- セグメントごとに `loading.tsx` / `error.tsx` / `not-found.tsx` を配置。
- **Route Groups**（例: `(auth)`, `(dashboard)`）で責務分離。グループ名は URL に現れない。

## (auth) と (dashboard)
- `(auth)` は公開ページ（`/signin` など）。
- `(dashboard)` は保護領域。`layout.tsx`（RSC）でセッション判定し、未認証なら `/signin` に `redirect()`。

### 認証チェック（概念例）
```tsx
// app/(dashboard)/layout.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = cookies().get('session')?.value;
  if (!session) redirect('/signin');
  return <>{children}</>;
}
```

## チェックリスト
- [ ] Read は GET API + RSC prefetch（Hydrate）
- [ ] Write は Server Actions（revalidate + Query invalidate）
- [ ] `providers.tsx` で QueryClientProvider を注入
- [ ] RSC の並列 fetch + `Suspense` を活用
