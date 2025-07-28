import AdminSidebar from "@/components/AdminSidebar";
import BottomNavigation from "@/components/BottomNavigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* サイドバー - PC表示のみ */}
      <AdminSidebar className="hidden md:block" />
      
      {/* メインコンテンツ */}
      <div className="flex-1">
        <main className="p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* ボトムナビゲーション - モバイル表示のみ */}
      <BottomNavigation className="md:hidden" />
    </div>
  );
}