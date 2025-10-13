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

### Hydrate 手順（RSC → Client）
1. RSC 内で `const qc = getQueryClient();` を呼び、QueryClient を生成する。  
2. Feature の `prefetch` ヘルパー（例: `prefetchTodos(qc)`）を await する。  
3. `const state = dehydrate(qc);` でキャッシュを取り出す。  
4. Client Component（`HydrateClient`）に `state` を渡し、その内部に表示用 Client Component（`TodosView` 等）を配置する。  
5. Client Component 側では `useXxxQuery()` を呼ぶだけで初期データが入る。

```ts
// app/(dashboard)/todos/page.tsx
import { dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/lib/query-client';
import { HydrateClient } from '@/shared/ui/hydrate-client';
import { prefetchTodos } from '@/features/todos/queries/prefetch';
import { TodosView } from './todos-view';

export default async function TodosPage() {
  const qc = getQueryClient();
  await prefetchTodos(qc);
  const state = dehydrate(qc);

  return (
    <HydrateClient state={state}>
      <TodosView />
    </HydrateClient>
  );
}
```

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
- [ ] RSC で `dehydrate(qc)` した state を `HydrateClient` に渡している
- [ ] Write は Server Actions（revalidate + Query invalidate）
- [ ] `providers.tsx` で QueryClientProvider を注入
- [ ] RSC の並列 fetch + `Suspense` を活用
