# アーキテクチャ概要（Overview）
**方針サマリ**：App Router 前提。**Read は API GET + TanStack Query**（RSC で prefetch → CSR で `<Hydrate>`）、**Write は Server Actions**（外部公開なし）。UI は **CDD**、機能は **Feature‑first 共置**。

---

## いますぐ判断できる早見表（やりたいこと → 参照ガイド）
- 新しいページ/レイアウトを作る・保護ルートにしたい → **[/app](./app.md)**
- **更新（POST/PUT/PATCH/DELETE）を実装**したい → **[/features](./features.md)**（Server Actions）
- **読み取り（GET）API** を追加/更新したい → **[/app/api](./app-api.md)**
- 機能（一覧/詳細/作成など）を丸ごと追加したい → **[/features](./features.md)**
- ヘッダー/サイドバー等、複数機能を束ねて再利用したい → **[/widgets](./widgets.md)**
- User など横断ドメインの型や小UIを共有したい → **[/entities](./entities.md)**
- Design System・共通ユーティリティ・hooks を整備/利用したい → **[/shared](./shared.md)**
- Unit/Integration/E2E・MSW・Storybook を整備したい → **[/test](./test.md)**

---

## データ取得の意思決定（超要約）
1) **読み取り（GET）** → **`app/api` の GET** を用意 → **RSC で prefetch** → CSR で **`<Hydrate>`**（TanStack Query）。  
   - RSC の `fetch` では `next: { tags: [...] }` を必ず付与し、Server Action で `revalidateTag` と対応させる。  
2) **更新（POST/PUT/PATCH/DELETE）** → **Server Actions** を実装（zod 検証 + `revalidatePath`/`revalidateTag`）。  
3) **頻繁更新/リアルタイム** → **CSR + Query**（`refetchInterval` / WS など）。  
4) **URLで受ける必要があるもの（Webhook/OAuth callback 等）** → 例外的に **`app/api`** を使用。

---

## ディレクトリ別ガイド（要点つき）

### 📁 /app — ルーティング/RSCの起点 → [ガイド](./app.md)
- **何をする場所？** App Router の中心。`layout.tsx` でセクション境界を作り、**RSCでデータ取得**。`providers.tsx` で QueryClient を注入。
- **使うタイミング**：新規ページ/レイアウトの作成、(auth)/(dashboard) の保護導線、RSC の並列 `fetch` 設計。
- **即ルール**：Read は GET API + RSC prefetch、Write は Server Actions。`(dashboard)` の `layout.tsx` で**認証チェック**。

### 📁 /app/api — **GET 専用**の内部API → [ガイド](./app-api.md)
- **何をする場所？** 外部公開しない**内部 GET API**。出力は zod で検証、統一レスポンスを返す。

### 📁 /features — 機能を丸ごと共置（**Server Actions をここに共置**） → [ガイド](./features.md)
- **何をする場所？** 1機能を **UI/queries/api/model/actions/pages** で完結。**更新は Server Actions**。

### 📁 /widgets — 複数機能を束ねる断片 → [ガイド](./widgets.md)
- Header/Sidebar/Card など**複数 Feature を組み合わせる** UI。I/O は持たず見た目に専念。

### 📁 /entities — 横断ドメインの型/小UI → [ガイド](./entities.md)
- User など**横断的で小さなドメイン**の型/スキーマ/小UI。重くなったら独立 Feature に。

### 📁 /shared — Design System と共通ユーティリティ → [ガイド](./shared.md)
- `ui/lib/hooks/styles` など**全体共有の基盤**。依存は**shared → features → app** の一方向。

### 📁 /test — テスト基盤（Unit/Integration/E2E） → [ガイド](./test.md)
- テスト設定、MSW、共通ユーティリティ。`__tests__` は **Feature 近接**、/test は**基盤**。

---

## グローバル・ガイドライン（全体に関わる規約）

### 1. Read/Write 方針
- **Read**: `app/api/*/route.ts` に **GET** を定義。RSC で **prefetch → dehydrate → `<Hydrate>`**。  
- **Write**: **Server Actions**（`'use server'`）で実装し、**外部公開は不要**。

### 2. TanStack Query の運用（Read専用）
- `keys.ts` に **queryKey を集中**（`as const`）。`staleTime` は 30–60s を基準。
- Prefetch は RSC のみ。CSR では `<Hydrate>` の後に必要なら再取得。

### 3. RSC fetch とタグ再検証
- RSC や Route Handler からの `fetch` は `next: { tags: [...] }` を必ず付与し、タグ命名は `'<feature>.<resource>'` 形式で一意にする。
- Server Action では `revalidateTag('<feature>.<resource>')` を呼び、再取得対象を明示。
- 例：
  ```ts
  // app/(dashboard)/todos/page.tsx
  const res = await fetch('https://example.com/api/todos', {
    next: { tags: ['todos.list'], revalidate: 60 },
  });
  ```

### 4. Hydrate フロー（RSC → Client）
- RSC で `getQueryClient()` を生成し、`prefetch` を実行 → `dehydrate(qc)` で状態を取得 → Client Component に `<Hydrate state={...}>` で渡す。
- `Hydrate` は 1 セグメント内で 1 回を基準にし、引数は `dehydrate` 結果をそのまま渡す。
- Client Component 側では通常通り `useQuery` を呼び、受け取った初期キャッシュを利用。
- 例：
  ```ts
  // app/(dashboard)/todos/page.tsx (RSC)
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
  ```tsx
  // shared/ui/hydrate-client.tsx (Client Component)
  'use client';
  import { HydrationBoundary, type DehydratedState } from '@tanstack/react-query';

  export function HydrateClient({
    state,
    children,
  }: {
    state: DehydratedState;
    children: React.ReactNode;
  }) {
    return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
  }
  ```
  ```tsx
  // app/(dashboard)/todos/todos-view.tsx (Client Component)
  'use client';
  import { useTodosQuery } from '@/features/todos/queries/useTodos';

  export function TodosView() {
    const { data } = useTodosQuery();
    return <TodoList data={data} />;
  }
  ```

### 5. ルーティング設計
- Route Groups（`(auth)`, `(dashboard)`）で責務分離。`(dashboard)` の `layout.tsx` で認証チェック。

### 6. API レスポンス（GET） & エラー
- 成功: `{ success: true, data }`。失敗: `{ success: false, error: { code, message } }`。
- Query/Server Components 側は `success` フラグを必ず判定し、失敗時はエラーを throw して UI の `error.tsx` や `onError` に委譲する。
- レスポンス契約は zod の **discriminated union** で検証し、`data` にアクセスする前に型を確定させる。
- UI は Query の `retry`, `select`, `onError` で分岐。`notFound()` を適切に。

### 7. Server Actions（Write）
- `features/<name>/actions.ts` に**共置**。`'use server'` + zodで**入力検証**。
- 成功後は **`revalidatePath`/`revalidateTag`** で RSC を最新化、CSR は **`invalidateQueries`** で同期。
- Client からは **`useMutation`** の `mutationFn` として **アクションを直接呼ぶ**か、**`<form action={action}>`** を利用。

### 8. セキュリティ & 環境変数
- `server-only` / `client-only` で境界を明示。シークレットはサーバー限定。`env.ts` を zod で検証。

### 9. 命名・CI・アンチパターン
- kebab/Pascal/useXxx、CI: `typecheck, lint, test, build, e2e`。  
- アンチパターン: UI からの直 `fetch`、`queryKey` 直書き、境界違反、Story/Tests の分離。

---

## 最短レシピ（よくある作業）
- **新しい一覧ページ（Read）**  
  1) `/app/api/<name>/route.ts` に **GET** を実装（zod 出力検証）  
  2) `/features/<name>/api` に fetcher + schema  
  3) `/features/<name>/queries` に `keys`/`useXxxQuery`/`prefetch`  
  4) `/app/(dashboard)/<path>/page.tsx` で **RSC prefetch → `<Hydrate>`**（prefetch 内の `fetch` には `next: { tags: [...] }` を設定）
- **作成/更新/削除（Write）**  
  1) `/features/<name>/actions.ts` に **Server Action** を実装（zod 入力検証 + `revalidatePath`/`revalidateTag` 対象タグは RSC の `fetch` と揃える）  
  2) CSR では `useMutation({ mutationFn: action })` を使い、成功時 `invalidateQueries` で同期  
  3) もしくは `<form action={action}>` で Progressive Enhancement
