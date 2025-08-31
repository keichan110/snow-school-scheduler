'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Snowflake,
  CalendarDots,
  Certificate,
  UsersThree,
  List,
  Tag,
  LinkSimple,
  UserGear,
} from '@phosphor-icons/react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  const adminMenuItems = [
    {
      href: '/admin/shifts',
      icon: CalendarDots,
      label: 'シフト管理',
    },
    {
      href: '/admin/instructors',
      icon: UsersThree,
      label: 'インストラクター管理',
    },
    {
      href: '/admin/shift-types',
      icon: Tag,
      label: 'シフト種類管理',
    },
    {
      href: '/admin/certifications',
      icon: Certificate,
      label: '資格管理',
    },
    {
      href: '/admin/invitations',
      icon: LinkSimple,
      label: '招待管理',
    },
    {
      href: '/admin/users',
      icon: UserGear,
      label: 'ユーザー管理',
    },
  ];

  return (
    <header className="fixed left-1/2 top-4 z-50 mx-auto w-full max-w-7xl -translate-x-1/2 px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border/20 bg-background/80 shadow-lg backdrop-blur-md">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 via-blue-300 to-indigo-400">
                  <Snowflake className="h-6 w-6 text-white" weight="bold" />
                </div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-foreground">Fuyugyō</h1>
                  {isAdminPath && (
                    <span className="rounded-md bg-violet-500/90 px-2 py-1 text-xs font-medium text-white shadow-sm">
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
                      <button className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-accent/50 hover:text-foreground">
                        <List className="h-5 w-5" weight="regular" />
                      </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[280px] sm:w-[400px]">
                      <SheetTitle className="mb-4 text-lg font-semibold">管理メニュー</SheetTitle>
                      <nav className="flex flex-col space-y-2">
                        {adminMenuItems.map((item) => {
                          const IconComponent = item.icon;
                          const isActive = pathname === item.href;

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setSheetOpen(false)}
                              className={`flex items-center space-x-3 rounded-lg px-3 py-3 transition-all duration-200 ${
                                isActive
                                  ? 'bg-primary/10 font-medium text-primary shadow-sm'
                                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                              }`}
                            >
                              <IconComponent
                                className="h-5 w-5"
                                weight={isActive ? 'fill' : 'regular'}
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
                          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 sm:h-auto sm:w-auto sm:justify-start sm:space-x-2 sm:px-3 sm:py-2 ${
                            isActive
                              ? 'bg-primary/10 font-medium text-primary shadow-sm'
                              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                          }`}
                        >
                          <IconComponent
                            className="h-5 w-5"
                            weight={isActive ? 'fill' : 'regular'}
                          />
                          <span className="hidden text-sm sm:inline">{item.label}</span>
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
