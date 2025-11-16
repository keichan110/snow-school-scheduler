"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

/**
 * 資格フィルターコンポーネント
 *
 * @remarks
 * Client Component として実装され、URL パラメータを使用してフィルター状態を管理します。
 * フィルター変更時に URL を更新することで、Server Component の再レンダリングをトリガーします。
 *
 * フィルター項目:
 * - 部門フィルター (すべて/スキー/スノーボード)
 * - アクティブフィルター (アクティブのみ表示/すべて表示)
 *
 * @returns フィルターUIコンポーネント
 */
export function CertificationFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * フィルターパラメータを更新してURLを変更する
   *
   * @param key - 更新するパラメータのキー
   * @param value - 設定する値（空文字列の場合はパラメータを削除）
   */
  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      // URL を更新 → Server Component が再レンダリングされる
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const currentDepartment = searchParams.get("department") || "all";
  const showActiveOnly = searchParams.get("active") !== "false";

  return (
    <div className="flex items-center gap-4">
      {/* 部門フィルター */}
      <div className="flex items-center gap-2">
        <Label className="text-sm" htmlFor="department-filter">
          部門:
        </Label>
        <select
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          id="department-filter"
          onChange={(e) => updateFilter("department", e.target.value)}
          value={currentDepartment}
        >
          <option value="all">すべて</option>
          <option value="ski">スキー</option>
          <option value="snowboard">スノーボード</option>
        </select>
      </div>

      {/* アクティブフィルター */}
      <div className="flex items-center gap-2">
        <Switch
          checked={showActiveOnly}
          id="active-filter"
          onCheckedChange={(checked) =>
            updateFilter("active", checked ? "true" : "false")
          }
        />
        <Label className="text-sm" htmlFor="active-filter">
          アクティブのみ表示
        </Label>
      </div>
    </div>
  );
}
