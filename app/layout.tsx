import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Background from "@/components/Background";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "スキー・スノーボードスクール シフト管理システム",
  description: "スキー・スノーボードスクールのシフト管理を効率化するWebアプリケーション",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="snow-school-theme"
          value={{
            light: "light",
            dark: "dark", 
            system: "system"
          }}
        >
          <Background />
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
