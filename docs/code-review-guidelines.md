# Code Review Guidelines

このドキュメントはcode-reviewer subagentが参照するレビューガイドラインです。

## Quality Gate（品質基準）

以下の基準を満たさないコードはCRITICAL/HIGH問題として報告してください：

### 関数・コンポーネントのサイズ

- 関数は**50行以内**を推奨
- Reactコンポーネントは**100行以内**を推奨
- 超過する場合は分割を検討

### DRY原則（Don't Repeat Yourself）

- **10行以上の重複コード**は関数化
- 全く同じロジックの重複は即座に共通化
- 似たような処理は抽象化を検討

### YAGNI原則（You Aren't Gonna Need It）

- 未使用のコード・関数・コンポーネントは削除
- 使われていないimportは削除
- 将来使うかもしれない、は不要

### テスト

- ビジネスロジックを含む関数は**テスト必須**
- Reactコンポーネントは任意（ただし推奨）
- APIエンドポイントはテスト必須

## コードスタイル（Next.jsプロジェクト）

### TypeScript

- `interface`ではなく`type`で型定義
- `any`の使用は最小限に（やむを得ない場合はコメント必須）
- React Componentのpropsは`Props`という名前

### 制御構文

- if文は長さに関わらず必ず`{}`でくくる

  ```typescript
  // ❌ Bad
  if (condition) doSomething();

  // ✅ Good
  if (condition) {
    doSomething();
  }
  ```

### コメント

- **what（何をしているか）**は書かない→コードで表現
- **why（なぜこうするか）**を書く
- 日本語常体で記述（「〜する」）

### Next.js固有

- Server Componentを優先（"use client"は必要最小限）
- データフェッチはServer Componentで実施
- 環境変数は`process.env.NEXT_PUBLIC_*`（クライアント）と分離

## セキュリティチェックリスト

必ず以下を確認してください：

- [ ] ユーザー入力は全てバリデーション済み
- [ ] SQLクエリはパラメータ化（準備文）を使用
- [ ] 機密情報（API Key、パスワード）のハードコードなし
- [ ] XSS対策（`dangerouslySetInnerHTML`の使用は慎重に）
- [ ] CSRF対策（APIエンドポイント）
- [ ] 認証・認可チェックの実装

## パフォーマンスチェックリスト

- [ ] 不要な`useEffect`の除去
- [ ] `useMemo`/`useCallback`の適切な使用
- [ ] 画像は`next/image`を使用
- [ ] 重い計算はメモ化
- [ ] ループ内でのAPI呼び出しなし

## レビューのコツ

### 変更の意図を理解する

コードを見る前に、何を実現しようとしているかを理解してください。

### ポジティブなフィードバックも

問題指摘だけでなく、良い実装は「👍 Good practice」として認める。

### 実用性を重視

完璧を求めすぎず、実務で機能することを優先。

### プロジェクトの文脈を考慮

既存コードのスタイルや設計思想を尊重し、一貫性を保つ。
