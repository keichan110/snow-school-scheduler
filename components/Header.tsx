"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Snowflake, CalendarDots, Certificate, UsersThree, List } from "@phosphor-icons/react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith("/admin");
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

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
      <div className="bg-background/80 backdrop-blur-md shadow-lg border border-border/20 rounded-2xl">
        <div className="px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 via-blue-300 to-indigo-400 rounded-lg flex items-center justify-center">
                  <Snowflake className="w-6 h-6 text-white" weight="bold" />
                </div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-foreground">Fuyugyō</h1>
                  {isAdminPath && (
                    <span className="px-2 py-1 text-xs font-medium bg-violet-500/90 text-white rounded-md shadow-sm">
                      管理者
                    </span>
                  )}
                </div>
              </Link>
            </div>

            {isAdminPath && (
              <>
                {isMobile ? (
                  <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                      <button className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200">
                        <List className="w-5 h-5" weight="regular" />
                      </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[280px] sm:w-[400px]">
                      <SheetTitle className="text-lg font-semibold mb-4">管理メニュー</SheetTitle>
                      <nav className="flex flex-col space-y-2">
                        {adminMenuItems.map((item) => {
                          const IconComponent = item.icon;
                          const isActive = pathname === item.href;

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setSheetOpen(false)}
                              className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                                isActive
                                  ? "bg-primary/10 text-primary font-medium shadow-sm"
                                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                              }`}
                            >
                              <IconComponent
                                className="w-5 h-5"
                                weight={isActive ? "fill" : "regular"}
                              />
                              <span className="text-sm">{item.label}</span>
                            </Link>
                          );
                        })}
                      </nav>
                    </SheetContent>
                  </Sheet>
                ) : (
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
                              ? "bg-primary/10 text-primary font-medium shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
