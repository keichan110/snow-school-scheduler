# 📊 テストカバレッジ測定ガイド

## 概要

本プロジェクトではJest + TypeScriptを使用したテストカバレッジ測定基盤を構築しています。
目標カバレッジ80%を達成するための測定・監視・可視化システムを提供します。

## 🎯 カバレッジ目標

| メトリクス | 目標値 | 説明                           |
| ---------- | ------ | ------------------------------ |
| Statements | 80%    | 実行されたステートメントの割合 |
| Branches   | 80%    | 実行された分岐の割合           |
| Functions  | 80%    | 実行された関数の割合           |
| Lines      | 80%    | 実行された行の割合             |

## 📋 利用可能なコマンド

### 基本コマンド

```bash
# 基本的なカバレッジ測定
npm run test:coverage

# カバレッジレポート生成 + ブラウザ自動オープン
npm run test:coverage:open

# サマリー表示（CI向け静音モード）
npm run test:coverage:summary
```

### CI/CD向けコマンド

```bash
# CI環境最適化コマンド
npm run test:coverage:ci

# カバレッジレポートアップロード準備
npm run test:coverage:upload

# バッジ生成（shields.io連携）
npm run test:coverage:badge
```

## 📊 レポート形式

カバレッジレポートは以下の形式で同時出力されます：

### 1. テキスト形式（コンソール）

- `text`: 詳細なテーブル形式
- `text-summary`: 簡潔なサマリー

### 2. HTML形式（ブラウザ閲覧用）

- 場所: `coverage/html/index.html`
- 機能: ファイル別詳細表示、未カバー領域の可視化
- アクセス: `npm run test:coverage:open`で自動オープン

### 3. 機械読み取り形式（CI/CD統合用）

- `lcov`: `coverage/lcov.info`（広く対応）
- `json`: `coverage/coverage-final.json`（詳細データ）
- `json-summary`: `coverage/coverage-summary.json`（サマリー）
- `cobertura`: `coverage/coverage.xml`（XML形式）

## 🎨 カバレッジバッジ

### バッジ生成

```bash
npm run test:coverage:badge
```

### 生成されるファイル

- `coverage/badge-info.json`: バッジ情報
- shields.io用URL: コンソールに出力

### バッジ色分け

| カバレッジ | 色          | 説明     |
| ---------- | ----------- | -------- |
| 90%以上    | brightgreen | 優秀     |
| 80-89%     | green       | 良好     |
| 70-79%     | yellow      | 注意     |
| 60-69%     | orange      | 警告     |
| 60%未満    | red         | 改善必要 |

## ⚙️ 設定詳細

### Jest設定（jest.config.js）

#### カバレッジ収集対象

```javascript
collectCoverageFrom: [
  'app/**/*.{js,jsx,ts,tsx}',
  'components/**/*.{js,jsx,ts,tsx}',
  'features/**/*.{js,jsx,ts,tsx}',
  'hooks/**/*.{js,jsx,ts,tsx}',
  'lib/**/*.{js,jsx,ts,tsx}',
  'shared/**/*.{js,jsx,ts,tsx}',
  // 除外パターンは下記参照
];
```

#### 除外パターン

```javascript
// テストファイル
'!**/__tests__/**',
'!**/*.test.{js,jsx,ts,tsx}',
'!**/*.spec.{js,jsx,ts,tsx}',

// 設定・ビルドファイル
'!**/*.d.ts',
'!**/node_modules/**',
'!**/build/**',
'!**/.next/**',
'!**/coverage/**',

// Next.js特有ファイル
'!app/**/layout.{js,jsx,ts,tsx}',
'!app/**/loading.{js,jsx,ts,tsx}',
'!app/**/error.{js,jsx,ts,tsx}',
'!app/**/not-found.{js,jsx,ts,tsx}',

// 設定ファイル
'!next.config.{js,mjs}',
'!tailwind.config.{js,ts}',
'!postcss.config.{js,mjs}',
```

#### 閾値設定

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

## 🚀 CI/CD統合

### GitHub Actions統合例

```yaml
name: Coverage Report
on: [push, pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run coverage
        run: npm run test:coverage:ci

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage/lcov.info
```

### CI環境最適化

Jest設定でCI環境を自動検出：

```javascript
// CI環境での最適化
ci: process.env.CI === 'true',
forceExit: process.env.CI === 'true',
detectOpenHandles: process.env.CI !== 'true',
```

## 📈 カバレッジ向上のベストプラクティス

### 1. 段階的改善

- 現在の21%から段階的に向上
- コンポーネント単位で80%達成
- Critical pathの優先的テスト

### 2. 効果的なテスト戦略

- Unit tests: 90%以上
- Integration tests: 70%以上
- E2E tests: 主要ユーザーフロー

### 3. 除外設定の適切な管理

- テスト不要なファイル（設定、型定義）は適切に除外
- Next.js規約ファイル（layout、loading）は除外
- ビジネスロジックは必須カバー

## 🔍 トラブルシューティング

### カバレッジが0%になる場合

```bash
# キャッシュクリア
npx jest --clearCache

# 設定確認
npm run test:coverage -- --verbose
```

### HTMLレポートが表示されない場合

```bash
# 手動でブラウザオープン
open coverage/html/index.html

# または
npm run test:coverage:open
```

### CI環境でのタイムアウト

```bash
# maxWorkersを調整
npm run test:coverage:ci
```

## 📝 関連ファイル

| ファイル                    | 説明                           |
| --------------------------- | ------------------------------ |
| `jest.config.js`            | Jest設定（カバレッジ設定含む） |
| `package.json`              | カバレッジコマンド定義         |
| `scripts/coverage-badge.js` | バッジ生成スクリプト           |
| `coverage/`                 | 生成されるレポートディレクトリ |

## 🎯 次のステップ

1. **現在**: カバレッジ測定基盤構築完了
2. **A3**: Unit test実装によるカバレッジ向上
3. **A4**: Integration test追加
4. **F1**: CI/CD統合とカバレッジ監視

---

## サポート

カバレッジ測定に関する質問や問題は、開発チームまでお気軽にお問い合わせください。
