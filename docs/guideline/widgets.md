# /widgets ガイド

## 責務
- 複数 Feature を束ねる UI 断片（Header, Sidebar, DashboardCard など）。

## ルール
- I/O は持たず、上位（app/pages や features/pages）に委譲。
- Design System（`/shared/ui`）と Feature UI を組み合わせて構成。

## I/O 制限の詳細
- **禁止**: データフェッチング（`useQuery`, `useMutation`, `fetch`）、Server Actions 呼び出し、状態更新
- **許可**: Props 経由のイベントハンドラ、ローカル状態（`useState`）、グローバル状態の読み取りのみ
- **原則**: データとイベントは Props で受け取る

## チェックリスト
- [ ] 依存方向は UI → Widget → (Features UI) のみ（逆流なし）
- [ ] データフェッチングを持たず Props で受け取っているか
