'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Snowflake,
  CalendarDots,
  Certificate,
  UsersThree,
  Tag,
  LinkSimple,
  UserGear,
  List,
  type Icon,
} from '@phosphor-icons/react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@phosphor-icons/react';

type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER';

interface MenuItem {
  href: string;
  icon: Icon;
  label: string;
  description: string;
  requiredRole: UserRole;
}

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const allMenuItems: MenuItem[] = [
    {
      href: '/admin/shifts',
      icon: CalendarDots,
      label: 'シフト管理',
      description: 'シフト表の作成・編集・割り当て管理',
      requiredRole: 'MANAGER',
    },
    {
      href: '/admin/instructors',
      icon: UsersThree,
      label: 'インストラクター管理',
      description: 'スタッフ情報の登録・編集・確認',
      requiredRole: 'MANAGER',
    },
    {
      href: '/admin/shift-types',
      icon: Tag,
      label: 'シフト種別管理',
      description: 'シフトタイプの作成・編集・削除',
      requiredRole: 'MANAGER',
    },
    {
      href: '/admin/certifications',
      icon: Certificate,
      label: '資格管理',
      description: '各種資格・スキルの管理システム',
      requiredRole: 'MANAGER',
    },
    {
      href: '/admin/invitations',
      icon: LinkSimple,
      label: '招待管理',
      description: 'ユーザー招待リンクの発行・管理',
      requiredRole: 'ADMIN',
    },
    {
      href: '/admin/users',
      icon: UserGear,
      label: 'ユーザー管理',
      description: 'システム利用者の管理・権限設定',
      requiredRole: 'ADMIN',
    },
  ];

  // 権限チェック関数
  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user) return false;

    const roleHierarchy: Record<UserRole, number> = {
      ADMIN: 3,
      MANAGER: 2,
      MEMBER: 1,
    };

    const userRoleLevel = roleHierarchy[user.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    return userRoleLevel >= requiredRoleLevel;
  };

  // ユーザーの権限に基づいてメニューアイテムをフィルタリング
  const visibleMenuItems = allMenuItems.filter((item) => hasPermission(item.requiredRole));

  // 管理機能へのアクセス権限チェック（MANAGERレベル以上）
  const hasManagementAccess = hasPermission('MANAGER'); // MANAGERレベル以上

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
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-foreground">Fuyugyō</h1>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {/* ユーザーAvatar */}
              {user && (
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="flex h-8 w-8 items-center justify-center border-none bg-transparent p-0 hover:bg-transparent data-[state=open]:bg-transparent">
                        <Avatar className="h-8 w-8 cursor-pointer transition-all hover:ring-2 hover:ring-primary/20">
                          <AvatarImage src={user.profileImageUrl || ''} alt={user.displayName} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-100 via-blue-300 to-indigo-400 text-sm font-semibold text-white">
                            {user.displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="w-[280px] p-4">
                          <div className="space-y-4">
                            {/* ユーザー情報 */}
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage
                                  src={user.profileImageUrl || ''}
                                  alt={user.displayName}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-blue-100 via-blue-300 to-indigo-400 font-semibold text-white">
                                  {user.displayName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{user.displayName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {user.role === 'ADMIN'
                                    ? '管理者'
                                    : user.role === 'MANAGER'
                                      ? 'マネージャー'
                                      : 'メンバー'}
                                </p>
                              </div>
                            </div>

                            {/* ログアウトボタン */}
                            <div className="border-t pt-2">
                              <Button
                                variant="ghost"
                                className="h-8 w-full justify-start text-sm text-muted-foreground hover:text-foreground"
                                onClick={async () => {
                                  await logout();
                                  window.location.href = '/';
                                }}
                              >
                                <User className="mr-2 h-4 w-4" />
                                ログアウト
                              </Button>
                            </div>
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              )}

              {/* 管理メニュー */}
              {hasManagementAccess && visibleMenuItems.length > 0 && (
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="border-none bg-transparent">
                        <List className="h-5 w-5" weight="regular" />
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="w-[400px] p-4">
                          <div className="grid gap-3">
                            {visibleMenuItems.map((item) => {
                              const IconComponent = item.icon;
                              const isActive = pathname === item.href;

                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className={`flex items-start space-x-4 rounded-lg p-3 transition-all duration-200 hover:bg-accent/50 ${
                                    isActive
                                      ? 'bg-primary/10 text-primary'
                                      : 'text-muted-foreground hover:text-foreground'
                                  }`}
                                >
                                  <IconComponent
                                    className="h-6 w-6 shrink-0"
                                    weight={isActive ? 'fill' : 'regular'}
                                  />
                                  <div className="space-y-1">
                                    <h3 className="text-sm font-medium leading-none">
                                      {item.label}
                                    </h3>
                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                      {item.description}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
