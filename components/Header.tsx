"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Snowflake, CalendarDots, Certificate, UsersThree } from "@phosphor-icons/react";

export default function Header() {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');
  
  const adminMenuItems = [
    {
      href: "/admin/shifts",
      icon: CalendarDots,
      label: "シフト管理",
    },
    {
      href: "/admin/instructors", 
      icon: UsersThree,
      label: "インストラクター管理",
    },
    {
      href: "/admin/certifications",
      icon: Certificate,
      label: "資格管理",
    },
  ];

  return (
    <header className="w-full fixed top-4 left-1/2 -translate-x-1/2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-50">
      <div className="bg-slate-50/80 backdrop-blur-md shadow-lg border border-slate-50/20 rounded-2xl">
        <div className="px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 via-blue-300 to-indigo-400 rounded-lg flex items-center justify-center">
                  <Snowflake className="w-6 h-6 text-white" weight="bold" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Fuyugyō
                </h1>
              </Link>
            </div>
            
            {isAdminPath && (
              <nav className="flex items-center space-x-1">
                {adminMenuItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.label}
                      className={`flex items-center justify-center sm:justify-start sm:space-x-2 sm:px-3 sm:py-2 w-10 h-10 sm:w-auto sm:h-auto rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-white/80 text-blue-600 font-medium shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                      }`}
                    >
                      <IconComponent 
                        className="w-5 h-5" 
                        weight={isActive ? "fill" : "regular"} 
                      />
                      <span className="hidden sm:inline text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
