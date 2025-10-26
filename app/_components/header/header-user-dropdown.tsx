"use client";

import { User } from "@phosphor-icons/react";
import { useAuth } from "@/app/_providers/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AuthenticatedUser } from "@/types/actions";

/**
 * ユーザードロップダウンコンポーネント
 * 認証済みユーザーのアバターとメニューを表示
 *
 * クライアント側の認証状態変更(updateDisplayName, logout等)に即座に反応する。
 */
type HeaderUserDropdownProps = {
  /** サーバー側で取得済みのユーザー情報(フォールバック用) */
  user: AuthenticatedUser;
};

export function HeaderUserDropdown({
  user: serverUser,
}: HeaderUserDropdownProps) {
  // クライアント側の最新認証状態を購読
  const { user: clientUser } = useAuth();

  // クライアント状態が利用可能ならそちらを優先、なければサーバーデータを使用
  const user = (clientUser ?? serverUser) as AuthenticatedUser;
  // 権限に応じた日本語表示
  const getRoleLabel = (role: string): string => {
    switch (role) {
      case "ADMIN":
        return "管理者";
      case "MANAGER":
        return "マネージャー";
      default:
        return "メンバー";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-8 w-8 p-0" size="sm" variant="ghost">
          <Avatar className="h-8 w-8 cursor-pointer transition-all hover:ring-2 hover:ring-primary/20">
            <AvatarImage alt={user.displayName} src={user.pictureUrl || ""} />
            <AvatarFallback className="bg-gradient-to-br from-blue-100 via-blue-300 to-indigo-400 font-semibold text-sm text-white">
              {user.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px] p-4">
        <div className="space-y-4">
          {/* ユーザー情報 */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage alt={user.displayName} src={user.pictureUrl || ""} />
              <AvatarFallback className="bg-gradient-to-br from-blue-100 via-blue-300 to-indigo-400 font-semibold text-white">
                {user.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">{user.displayName}</p>
              <p className="text-muted-foreground text-xs">
                {getRoleLabel(user.role)}
              </p>
            </div>
          </div>

          {/* ログアウトボタン */}
          <div className="border-t pt-2">
            <DropdownMenuItem asChild>
              <Button
                className="h-8 w-full justify-start text-muted-foreground text-sm hover:text-foreground"
                onClick={() => {
                  // 専用ログアウトページにリダイレクト
                  // これにより保護されたページでの状態競合を回避
                  window.location.href = "/logout";
                }}
                variant="ghost"
              >
                <User className="mr-2 h-4 w-4" />
                ログアウト
              </Button>
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
