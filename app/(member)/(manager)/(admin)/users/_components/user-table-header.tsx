"use client";

import { Crown, Eye, EyeSlash, Star, User } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TableFilterRow,
  TableHeaderLayout,
  TableTitleRow,
} from "../../../_components/table-header";

/**
 * ユーザー管理ページのテーブルヘッダーコンポーネント
 *
 * @remarks
 * URL パラメータベースのフィルタリング対応
 * instructors ページと同じレイアウト構造を使用
 * ユーザーは LINE 連携で自動作成されるため、追加ボタンは不要
 */
export function UserTableHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const currentRole = searchParams.get("role") || "all";
  const currentStatus = searchParams.get("status") || "active";

  return (
    <TableHeaderLayout
      filterRow={
        <TableFilterRow
          leftFilter={
            <Tabs
              className="w-full sm:w-auto"
              onValueChange={(value) =>
                updateFilter("role", value === "all" ? "" : value)
              }
              value={currentRole}
            >
              <TabsList className="grid w-full grid-cols-4 sm:w-auto">
                <TabsTrigger value="all">すべて</TabsTrigger>
                <TabsTrigger className="flex items-center gap-1" value="ADMIN">
                  <Crown className="h-3 w-3" />
                  管理者
                </TabsTrigger>
                <TabsTrigger
                  className="flex items-center gap-1"
                  value="MANAGER"
                >
                  <Star className="h-3 w-3" />
                  マネージャー
                </TabsTrigger>
                <TabsTrigger className="flex items-center gap-1" value="MEMBER">
                  <User className="h-3 w-3" />
                  メンバー
                </TabsTrigger>
              </TabsList>
            </Tabs>
          }
          rightFilter={
            <div className="flex items-center space-x-2">
              <Switch
                checked={currentStatus === "active"}
                id="active-filter"
                onCheckedChange={(checked) =>
                  updateFilter("status", checked ? "active" : "all")
                }
              />
              <Label
                className="flex cursor-pointer items-center gap-1"
                htmlFor="active-filter"
              >
                {currentStatus === "active" ? (
                  <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <EyeSlash className="h-4 w-4 text-gray-500" />
                )}
                アクティブのみ
              </Label>
            </div>
          }
        />
      }
      titleRow={<TableTitleRow title="ユーザー一覧" />}
    />
  );
}
