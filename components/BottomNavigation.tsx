"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDots, Certificate, UsersThree, Snowflake } from "@phosphor-icons/react";

interface BottomNavigationProps {
  className?: string;
}

export default function BottomNavigation({ className }: BottomNavigationProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      href: "/",
      icon: Snowflake,
      label: "",
    },
    {
      href: "/admin/certifications",
      icon: Certificate,
      label: "資格管理",
    },
    {
      href: "/admin/instructors",
      icon: UsersThree,
      label: "インストラクター",
    },
    {
      href: "/admin/shifts",
      icon: CalendarDots,
      label: "シフト管理",
    },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 ${className}`}>
      <div className="flex justify-around items-center py-3 pb-safe">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-lg transition-all duration-300 min-w-0 ${
                isActive 
                  ? "nav-active" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {item.href === "/" ? (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-gray-100" : "bg-gradient-to-br from-blue-100 via-blue-300 to-indigo-400"
                }`}>
                  <IconComponent 
                    className={`w-5 h-5 ${isActive ? "icon-active-color" : "text-white"}`}
                    weight="bold" 
                  />
                </div>
              ) : (
                <IconComponent 
                  className={`w-5 h-5 ${item.label ? "mb-1" : ""} ${isActive ? "icon-active-color" : "text-gray-600"}`} 
                  weight={isActive ? "fill" : "regular"} 
                />
              )}
              {item.label && (
                <span className={`text-xs font-medium truncate ${isActive ? "text-gradient" : ""}`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}