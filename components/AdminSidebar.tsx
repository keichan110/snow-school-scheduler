"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { CalendarDots, Certificate, UsersThree, CaretLeft, CaretRight, Snowflake, SlidersHorizontal } from "@phosphor-icons/react";

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      href: "/admin/certifications",
      icon: Certificate,
      label: "資格管理",
    },
    {
      href: "/admin/instructors",
      icon: UsersThree,
      label: "インストラクター管理",
    },
    {
      href: "/admin/shifts",
      icon: CalendarDots,
      label: "シフト管理",
    },
  ];

  return (
    <div className={`${isCollapsed ? "w-16" : "w-64"} bg-white shadow-lg transition-all duration-300 ease-in-out relative ${className}`}>
      {/* トグルボタン - サイドバーから飛び出すデザイン */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm z-10"
        title={isCollapsed ? "メニューを展開" : "メニューを縮小"}
      >
        {isCollapsed ? (
          <CaretRight className="w-3 h-3 text-gray-600" weight="bold" />
        ) : (
          <CaretLeft className="w-3 h-3 text-gray-600" weight="bold" />
        )}
      </button>

      {/* アプリタイトル部分 */}
      <div className="p-4 border-b border-gray-200">
        {!isCollapsed ? (
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 via-blue-300 to-indigo-400 rounded-lg flex items-center justify-center">
              <Snowflake className="w-5 h-5 text-white" weight="bold" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Fuyugyō
            </h1>
          </Link>
        ) : (
          <Link href="/" className="flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 via-blue-300 to-indigo-400 rounded-lg flex items-center justify-center">
              <Snowflake className="w-5 h-5 text-white" weight="bold" />
            </div>
          </Link>
        )}
      </div>
      
      {/* 管理者メニューセクション */}
      <div className="p-4 border-b border-gray-200">
        {!isCollapsed ? (
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" weight="regular" />
            <span className="text-sm font-medium text-gray-700">管理者機能</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" weight="regular" />
          </div>
        )}
      </div>
      
      {/* ナビゲーション */}
      <nav className="py-4">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <div key={item.href} className={`px-3 ${index > 0 ? "mt-1" : ""}`}>
              <Link 
                href={item.href}
                className={`flex items-center px-3 py-3 rounded-lg transition-all duration-300 group relative ${
                  isActive 
                    ? "nav-active-sidebar" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <IconComponent 
                  className={`w-5 h-5 ${isCollapsed ? "mx-auto" : "mr-3"} ${isActive ? "icon-active-color" : "text-gray-600"}`} 
                  weight={isActive ? "fill" : "regular"} 
                />
                
                {!isCollapsed && (
                  <span className={`font-medium ${isActive ? "text-gradient" : ""}`}>
                    {item.label}
                  </span>
                )}
                
                {/* 縮小時のツールチップ */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                    {/* 矢印 */}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* フッター - Copyright */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        {!isCollapsed ? (
          <div className="text-xs text-gray-500 text-center">
            © 2025 Keisuke Ito. All rights reserved.
          </div>
        ) : (
          <div className="text-xs text-gray-500 text-center">
            ©
          </div>
        )}
      </div>
    </div>
  );
}