import type { Metadata } from "next";
import "./globals.css";
import Background from "@/app/_components/layout/background";
import { ThemeProvider } from "@/app/_components/providers/theme-provider";
import { NotificationProvider } from "@/app/_components/shared/notifications";
import { QueryProvider } from "@/shared/providers/query-client";

export const metadata: Metadata = {
  title: "スキー・スノーボードスクール シフト管理システム",
  description:
    "スキー・スノーボードスクールのシフト管理を効率化するWebアプリケーション",
};

/**
 * ルートレイアウト
 *
 * グローバルプロバイダーのみを提供し、認証状態管理とUIレイアウトは
 * 各ルートグループ（(public), (member)）に委譲する設計。
 *
 * - AuthProvider: 各ルートグループで個別に配置
 * - Header/Footer: 各ルートグループで必要に応じて配置
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            storageKey="snow-school-theme"
            value={{
              light: "light",
              dark: "dark",
              system: "system",
            }}
          >
            <NotificationProvider>
              <Background />
              {children}
            </NotificationProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
