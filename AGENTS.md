# Repository Guidelines

## プロジェクト構成と責務
- `app` は App Router の起点。読み取りは RSC で並列 `fetch`、クライアント相互作用は prefetch→dehydrate→`<Hydrate>` を徹底します。
- `features/<domain>` に UI・queries・api を共置し、外部公開は `index.ts` 経由のみ。UI から API へは queries を必ず介してください。
- `widgets` は複数 Feature を束ねる表示コンポーネント、`entities` は横断ドメインの型と最小 UI。肥大化したら Feature へ昇格検討。
- `shared/{ui,lib,hooks}` は下位レイヤーとして再利用部品を配置。依存矢印は shared → features → app の一方向を守ります。
- テストは対象ディレクトリ直下の `__tests__` に近接配置し、詳細は `docs/guideline/test.md` を参照。全体方針は `docs/guideline/overview.md` で常に最新を確認してください。

## ビルド・テスト・ローカル開発
- 開発サーバー: `npm run dev`（Next.js App Router）。
- 静的検証: `npm run lint` と `npm run typecheck` を PR 前にセットで実行。
- 単体テスト: `npm run test:unit`、統合テスト: `npm run test:integration`、E2E: `npm run test:e2e`。
- カバレッジ確認: `npm run test:coverage`、CI 同等チェック: `npm run test:validate`。
- ビルド検証: `npm run build`。Cloudflare D1 を触る場合は `npm run db:push`・`npm run db:seed`。

## コーディングスタイルと命名
- TypeScript + React。プリティアによる 2 スペースインデント、セミコロン有り。`npm run format:check` で整形差分を検証。
- ESLint（`eslint-config-next`）必須。hooks は `useXxx`、コンポーネントは PascalCase、ファイル名は kebab-case。
- CDD を採用し、Story/テストを隣接配置。UI は TanStack Query の結果のみを受け取り、副作用は queries/api 層へ閉じ込めます。
- 詳細なコーディング規約・責務分離ルールは `docs/guideline/` 以下の各ドキュメントを参照し、改訂履歴を確認してください。

## テストガイドライン
- Jest + Testing Library を基本とし、MSW で API をモック。テストファイルは `*.test.ts(x)` 命名。
- 代表的な状態（loading/error/empty/filled）を Story とテスト双方で網羅。Query キーは `keys.ts` から import。
- カバレッジは主要機能で 80% 以上を目安にしつつ、クリティカルフローは E2E で認証→操作まで通します。

## コミットとプルリクエスト
- コミットは Gitmoji + 英語動詞命令形（例: `:recycle: Refine shift loader`）。論理的に独立した変更ごとに分割し、範囲を最小化します。
- PR では概要・技術的判断・リスクを明記し、UI 変更はスクリーンショットか Storybook キャプチャを添付。
- `typecheck` / `lint` / `test` / `build` を通したログを共有し、関連 Issue や Notion タスクをリンク。

## セキュリティと設定メモ
- 環境変数は `env.ts` の zod で起動時検証。シークレットは `server-only` 境界内に留め、クライアントへ渡さない。
- 内部 API は `app/api/*/route.ts` に集約し、リクエスト/レスポンスとも zod スキーマで検証。失敗時は `{ success: false, error }` で統一。
- Node.js は 22 以上。RSC で取得できるデータは RSC で取得し、CSR が必要な場合のみ TanStack Query を利用します。
