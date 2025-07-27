import type { Metadata } from "next";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";

export const metadata: Metadata = {
  title: "スキー・スノーボードスクール シフト管理システム",
  description: "スキー・スノーボードスクールのシフト管理を効率化するWebアプリケーション",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="antialiased bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
