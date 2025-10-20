# /test ガイド（Unit/Integration/E2E と基盤）

## 責務
- テスト基盤（Vitest/Jest 設定、RTL、MSW、E2E ツールなど）。

## ルール
- **Unit/Integration** は Feature 配下の `__tests__` に近接配置し、/test は**共通セットアップ**に専念。
- **MSW** ハンドラは /test に集約し、Storybook と共有可能に。
- **E2E（Playwright）** はクリティカルパス（認証→ダッシュボード→更新）を優先。

## テスト配置ルール
- **Unit/Integration**: テスト対象と同階層の `__tests__/` に配置、命名は `<対象>.test.ts(x)`
- **E2E**: プロジェクトルートの `/e2e/` に配置、命名は `<フロー>.spec.ts`
- **Storybook**: コンポーネントと同階層に `<Component>.stories.tsx`

## 推奨セットアップ
- `test/setup-tests.ts` … RTL/MSW 初期化
- `test/msw.ts` … 共通ハンドラ
- `e2e/` … E2E スイート（必要なら）
- `.storybook/` … Storybook（QueryClient decorator + MSW）

## 認証・認可のテスト戦略

### Role-based Guards のテスト
- `ensureRole` の各パターン（authorized, unauthenticated, forbidden）を検証
- 各ルートグループの layout.tsx で適切なリダイレクトが行われることを確認
- テスト例: `app/(member)/__tests__/layout.test.tsx`

### AuthProvider のテスト
- 初期状態の設定（authenticated/unauthenticated）
- ユーザー情報の管理（login, logout, updateDisplayName）
- Context の提供と useAuth() フックの動作
- テスト例: `contexts/__tests__/auth-context.test.tsx`

### Server Actions のテスト
- 権限チェックの実装確認
- 適切なエラーレスポンスの返却
- revalidatePath/revalidateTag の呼び出し確認

## チェックリスト
- [ ] 主要コンポーネントの Story があり、loading/error/empty/filled を再現
- [ ] MSW でネットワークをモック（デフォルトで外部通信しない）
- [ ] role-based guards と layouts のテストが実装されている
- [ ] AuthProvider の主要機能（login, logout, 状態管理）がテストされている
- [ ] 権限チェックが必要な Server Actions にテストがある
- [ ] Playwright で主要フロー（認証→権限別アクセス）がカバーされている
