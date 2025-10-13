# /features ガイド（Feature-first 共置）

## 責務
- 1機能を **UI / queries（Read） / api（Read fetcher） / actions（Write） / model / pages（任意）** で完結。  
- 外部には `index.ts` で**公開面を明示**（内部直 import 禁止）。

## 標準構成
```
/features/<feature>/
  /components    # CDDの実体（小〜中スコープ）。Story/Tests 近接
  /queries       # TanStack Query（Read: keys, hooks, prefetch）
  /api           # Read用 fetcher + zod スキーマ + endpoints（GETのみ）
  /actions.ts    # Write用 Server Actions（'use server' + zod）
  /model         # types + mapper + usecase
  /pages         # 任意：組み立て用のページ断片
  index.ts
```

## ルール
- **Read（GET）**: `/app/api` → `/features/<feature>/api` → `/features/<feature>/queries`（UIは queries 経由）。
  - RSC からの `fetch` は `next: { tags: ['<feature>.<resource>'] }` を必ず指定し、Server Action の `revalidateTag` と対応させる。
- **Write（POST/PUT/PATCH/DELETE）**: **Server Actions** を `/features/<feature>/actions.ts` に共置。CSR では `useMutation` から直接呼ぶ or `<form action>`。
- I/O は **zod** で検証。UI は安全な型のみ扱う。
- GET レスポンスは `success` を discriminated union で検証し、`success: false` の場合は明示的に throw する。
- `keys.ts` に `queryKey` を集中（`as const`）。

## サンプル（Server Actions: Write）
```ts
// features/todos/actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath, revalidateTag } from 'next/cache';

const Create = z.object({ title: z.string().min(1) });

export async function createTodoAction(input: unknown) {
  const { title } = Create.parse(input);
  // DB 書き込みなど…
  revalidatePath('/todos');
  revalidateTag('todos.list');
  return { id: String(Date.now()), title, done: false };
}
```

```ts
// features/todos/queries/useCreateTodo.ts
'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTodoAction } from '../actions';
import { todoKeys } from './keys';

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { title: string }) => createTodoAction(vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}
```

## サンプル（Read: GET + Query）
```ts
// features/todos/api/schema.ts
import { z } from 'zod';
export const Todo = z.object({ id: z.string(), title: z.string(), done: z.boolean() });
export const TodoList = z.array(Todo);
export const TodoResponse = z.discriminatedUnion('success', [
  z.object({ success: z.literal(true), data: TodoList }),
  z.object({
    success: z.literal(false),
    error: z.object({ code: z.string(), message: z.string().optional() }),
  }),
]);
```

```ts
// features/todos/api/client.ts
import { fetchJson } from '@/shared/lib/fetch';
import { TodoList, TodoResponse } from './schema';

export async function fetchTodos() {
  const res = await fetchJson<unknown>('/api/todos', {
    next: { tags: ['todos.list'], revalidate: 60 },
  });
  const parsed = TodoResponse.parse(res);
  if (!parsed.success) {
    throw new Error(parsed.error.code);
  }
  return TodoList.parse(parsed.data);
}
```

```ts
// features/todos/queries/keys.ts
export const todoKeys = {
  all: ['todos'] as const,
  list: (filter?: string) => [...todoKeys.all, 'list', { filter }] as const,
};
```

```ts
// features/todos/queries/prefetch.ts
import { QueryClient } from '@tanstack/react-query';
import { todoKeys } from './keys';
import { fetchTodos } from '../api/client';

export async function prefetchTodos(qc: QueryClient, filter?: string) {
  await qc.prefetchQuery({
    queryKey: todoKeys.list(filter),
    queryFn: () => fetchTodos(),
  });
}
```
