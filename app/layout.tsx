import type { Metadata } from "next";
import "./globals.css";
import Background from "@/components/Background";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { NotificationProvider } from "@/components/notifications";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/shared/providers/query-client";

export const metadata: Metadata = {
  title: "スキー・スノーボードスクール シフト管理システム",
  description:
    "スキー・スノーボードスクールのシフト管理を効率化するWebアプリケーション",
};

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
            <AuthProvider>
              <NotificationProvider>
                <Background />
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-32 sm:px-6 lg:px-8">
                    {children}
                  </main>
                  <Footer />
                </div>
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
