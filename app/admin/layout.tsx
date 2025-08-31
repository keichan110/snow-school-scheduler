'use client';

import { ReactNode } from 'react';
import { ProtectedLayout } from '@/components/auth/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  House,
  Shield,
  Warning,
  CalendarDots,
  UsersThree,
  Tag,
  Certificate,
  LinkSimple,
  UserGear,
} from '@phosphor-icons/react';

/**
 * 管理者レイアウト
 * 管理者権限が必要なすべてのページを保護
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedLayout layoutName="Admin" requiredRole="ADMIN" fallback={<AdminAccessDenied />}>
      <div className="flex min-h-screen">
        {/* サイドバーナビゲーション */}
        <AdminSidebar />

        {/* メインコンテンツ */}
        <div className="flex-1 lg:ml-64">
          <div className="space-y-6 p-4 lg:p-8">
            <div className="rounded-lg bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-muted-foreground">管理者エリア</span>
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}

/**
 * 管理者サイドバーナビゲーション
 */
function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      href: '/admin',
      icon: House,
      label: 'ダッシュボード',
      description: '管理機能の概要',
    },
    {
      href: '/admin/shifts',
      icon: CalendarDots,
      label: 'シフト管理',
      description: 'シフト作成・編集・割り当て',
    },
    {
      href: '/admin/instructors',
      icon: UsersThree,
      label: 'インストラクター管理',
      description: 'スタッフの登録・編集',
    },
    {
      href: '/admin/shift-types',
      icon: Tag,
      label: 'シフト種別管理',
      description: 'シフト種別マスタ管理',
    },
    {
      href: '/admin/certifications',
      icon: Certificate,
      label: '資格管理',
      description: 'インストラクター資格管理',
    },
    {
      href: '/admin/invitations',
      icon: LinkSimple,
      label: '招待管理',
      description: '新規メンバー招待URL管理',
    },
    {
      href: '/admin/users',
      icon: UserGear,
      label: 'ユーザー管理',
      description: 'システムユーザー権限管理',
    },
  ];

  return (
    <>
      {/* デスクトップサイドバー */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col border-r border-border bg-card pt-20">
          <div className="flex flex-grow flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 p-4">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/10 font-medium text-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    }`}
                  >
                    <IconComponent
                      className="h-5 w-5 flex-shrink-0"
                      weight={isActive ? 'fill' : 'regular'}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground group-hover:text-foreground/70">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * 管理者権限がない場合の表示コンポーネント
 */
function AdminAccessDenied() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            <Warning className="h-16 w-16 text-orange-500" />
          </div>
          <h2 className="mb-3 text-xl font-semibold">アクセス権限がありません</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            このページにアクセスするには管理者権限が必要です。
            <br />
            管理者アカウントでログインしてください。
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="outline">
              <Link href="/">
                <House className="mr-2 h-4 w-4" />
                ホームへ戻る
              </Link>
            </Button>
            <Button asChild>
              <Link href="/login">
                <Shield className="mr-2 h-4 w-4" />
                管理者でログイン
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
