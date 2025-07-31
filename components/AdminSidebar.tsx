"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDots, Certificate, UsersThree, Snowflake, SlidersHorizontal } from "@phosphor-icons/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className }: AdminSidebarProps) {
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
    <Sidebar className={className} collapsible="icon">
      <SidebarHeader>
        <Link href="/" className="flex items-center space-x-2 px-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 via-blue-300 to-indigo-400 rounded-lg flex items-center justify-center">
            <Snowflake className="w-5 h-5 text-white" weight="bold" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent group-data-[collapsible=icon]:hidden">
            Fuyugyō
          </h1>
        </Link>
      </SidebarHeader>
      
      <SidebarSeparator />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4" weight="regular" />
            <span>管理者機能</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.label}
                      className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}
                    >
                      <Link href={item.href}>
                        <IconComponent 
                          className="w-5 h-5" 
                          weight={isActive ? "fill" : "regular"} 
                        />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="text-xs text-muted-foreground text-center px-2">
          <span className="group-data-[collapsible=icon]:hidden">
            © 2025 Keisuke Ito. All rights reserved.
          </span>
          <span className="group-data-[collapsible=icon]:block hidden">
            ©
          </span>
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}