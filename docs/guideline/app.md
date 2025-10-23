# /app ガイド

## 責務
- ルーティングとレイアウトの起点（App Router）。
- **RSC による読み取り**のハブ。セグメントごとの `layout.tsx` で境界/責務を閉じる。
- `providers.tsx` で **QueryClientProvider** 等のクライアント・プロバイダを注入。

## ルール
- 読み取りは **`app/api`（GET） + RSC prefetch → `<Hydrate>`**。
- **更新は Server Actions**（`features/<name>/actions.ts`）を利用。CSR では `useMutation` で呼び出し or `<form action>`。
- `QueryProvider` は **ルートレイアウト（app/layout.tsx）で一度だけラップ**。
- セグメントごとに `loading.tsx` / `error.tsx` / `not-found.tsx` を配置。
- **Route Groups**（例: `(public)`, `(member)`, `(manager)`, `(admin)`）で権限ベースの責務分離。グループ名は URL に現れない。
- **AuthProvider は各ルートグループの layout.tsx で個別に配置**（二重ラップを防ぐため、ルートレイアウトには配置しない）。

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

## Route Groups による権限ベースのルーティング

このプロジェクトでは以下の4つのルートグループで権限を分離しています：

### `(public)` - 未認証ユーザーもアクセス可能
- 用途: login, logout, privacy, terms など公開ページ
- 認証: 不要
- AuthProvider: **基本的に配置しない**（認証状態管理が不要なため）
  - 例外: `/logout` ページのみ専用レイアウト（`app/(public)/logout/layout.tsx`）で AuthProvider を配置
  - ログアウト処理で `useAuth().logout()` を呼び出す必要があるため

### `(member)` - MEMBER 以上の権限が必要
- 用途: shifts（シフト閲覧）など、一般メンバー向け機能
- 認証: `ensureRole({ atLeast: "MEMBER" })` で権限チェック
- AuthProvider: 初期ユーザー情報（`initialUser`）を渡して配置

### `(manager)` - MANAGER 以上の権限が必要
- 用途: instructors, certifications, shift-types の管理
- 認証: `ensureRole({ atLeast: "MANAGER" })` で権限チェック
- ネスト: `(member)` 配下に `(manager)` を配置（`app/(member)/(manager)/`）

### `(admin)` - ADMIN 権限が必要
- 用途: users, invitations の管理
- 認証: `ensureRole({ atLeast: "ADMIN" })` で権限チェック
- ネスト: `(member)/(manager)` 配下に `(admin)` を配置（`app/(member)/(manager)/(admin)/`）

### 認証チェックの実装例

```tsx
// app/(member)/layout.tsx
import { redirect } from 'next/navigation';
import { AuthProvider } from '@/contexts/auth-context';
import { ensureRole } from '@/lib/auth/role-guard';
import { buildLoginRedirectUrl, ACCESS_DENIED_REDIRECT } from '@/lib/auth/auth-redirect';

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const result = await ensureRole({ atLeast: "MEMBER" });

  if (result.status === "unauthenticated") {
    redirect(await buildLoginRedirectUrl());
  }

  if (result.status === "forbidden") {
    redirect(ACCESS_DENIED_REDIRECT);
  }

  const { user } = result; // status === "authorized"

  return (
    <AuthProvider initialStatus="authenticated" initialUser={user}>
      <Header />
      <main>{children}</main>
      <Footer />
    </AuthProvider>
  );
}
```

### 重要な設計ポイント
- **AuthProvider の配置戦略**:
  - `(public)` グループ: 基本的に AuthProvider を配置しない（認証状態管理が不要）
    - 例外: `/logout` ページのみ専用レイアウトで配置（ログアウト処理のため）
  - `(member)` 以降: 各ルートグループの layout.tsx で AuthProvider を配置
  - ルートレイアウト（app/layout.tsx）には配置しない（二重ラップ防止）
- **初期データの活用**: `ensureRole` で取得したユーザー情報を AuthProvider の `initialUser` に渡すことで、クライアント側での追加フェッチを回避
- **ネストされたルートグループ**: 権限レベルに応じてルートグループをネストし、URL構造をシンプルに保つ

## チェックリスト
- [ ] Read は GET API + RSC prefetch（Hydrate）
- [ ] RSC で `dehydrate(qc)` した state を `HydrateClient` に渡している
- [ ] Write は Server Actions（revalidate + Query invalidate）
- [ ] ルートレイアウトで QueryProvider を注入（一度だけ）
- [ ] AuthProvider の配置は適切か
  - `(public)` グループ: 基本的に配置しない（`/logout` のみ例外）
  - `(member)` 以降: 各ルートグループの layout.tsx で配置
  - 二重ラップが発生していない
- [ ] 保護ルートでは `ensureRole` による権限チェックを実装
- [ ] RSC の並列 fetch + `Suspense` を活用
