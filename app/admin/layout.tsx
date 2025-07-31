import AdminSidebar from "@/components/AdminSidebar";
import BottomNavigation from "@/components/BottomNavigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar className="hidden md:flex" />
      <SidebarInset className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <header className="flex h-16 items-center gap-2 px-4 md:hidden">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </SidebarInset>
      
      {/* ボトムナビゲーション - モバイル表示のみ */}
      <BottomNavigation className="md:hidden" />
    </SidebarProvider>
  );
}