# /widgets ガイド

## 責務
- 複数 Feature を束ねる UI 断片（Header, Sidebar, DashboardCard など）。

## ルール
- I/O は持たず、上位（app/pages や features/pages）に委譲。
- Design System（`/shared/ui`）と Feature UI を組み合わせて構成。

## チェックリスト
- [ ] 依存方向は UI → Widget → (Features UI) のみ（逆流なし）
