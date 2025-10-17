# /entities ガイド

## 責務
- 複数 Feature から参照される小さめの横断ドメイン（User, Project 等）。

## ルール
- API / Query は持たず、**型/スキーマ/小UI** を中心にする。
- 大きくなり始めたら独立した Feature へ昇格を検討。

## 判断基準
- **entities に配置**: 3つ以上の Feature から参照される + 独自 CRUD なし + 単純な型/小UI
- **features に配置**: 独自の CRUD API を持つ or 複雑なビジネスロジック
- **迷ったら**: まず features に配置し、3箇所目の参照時に entities へ昇格を検討

## チェックリスト
- [ ] 本当に横断的か？（Feature で閉じられないか見直す）
- [ ] 独自の CRUD API を持たないか？（持つなら Feature へ）
