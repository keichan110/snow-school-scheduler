# /shared ガイド（ui / lib / hooks / styles）

## 責務
- アプリ横断の共有資産（Design System / ランタイム非UIユーティリティ / hooks / styles）。

## 一方向依存
- **shared → features → app** の一方向。shared は上位に依存しない。

## サブディレクトリとルール
### /shared/ui
- 汎用 UI（Button, Card, Dialog…）。ビジネスロジックを含めない。
- Story は必須。アクセシビリティ（キーボード操作等）を担保。

### /shared/lib
- `queryClient`, `hydrateClient`, `env`, `fetch` など。
- ラッパは薄く、 zod で env を起動時に検証。

### /shared/hooks
- 再利用 hooks（I/O は持たない）。SSR/CSR の相性に配慮。

### /shared/styles
- `globals.css` は最小限。コンポーネント固有のスタイルは近接配置。

## チェックリスト
- [ ] shared から上位層への依存がない
- [ ] 破壊的変更の影響範囲が把握できている
