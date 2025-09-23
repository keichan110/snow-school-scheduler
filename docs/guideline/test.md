# /test ガイド（Unit/Integration/E2E と基盤）

## 責務
- テスト基盤（Vitest/Jest 設定、RTL、MSW、E2E ツールなど）。

## ルール
- **Unit/Integration** は Feature 配下の `__tests__` に近接配置し、/test は**共通セットアップ**に専念。
- **MSW** ハンドラは /test に集約し、Storybook と共有可能に。
- **E2E（Playwright）** はクリティカルパス（認証→ダッシュボード→更新）を優先。

## 推奨セットアップ
- `test/setup-tests.ts` … RTL/MSW 初期化
- `test/msw.ts` … 共通ハンドラ
- `e2e/` … E2E スイート（必要なら）
- `.storybook/` … Storybook（QueryClient decorator + MSW）

## チェックリスト
- [ ] 主要コンポーネントの Story があり、loading/error/empty/filled を再現
- [ ] MSW でネットワークをモック（デフォルトで外部通信しない）
- [ ] Playwright で主要フローがカバーされている
