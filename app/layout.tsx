import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'スキー・スノーボードスクール シフト管理システム',
  description: 'スキー・スノーボードスクールのシフト管理を効率化するWebアプリケーション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <main>{children}</main>
      </body>
    </html>
  )
}