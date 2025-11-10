"use client";

import { Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { FormattedInstructor } from "../_lib/types";

/**
 * インストラクターリストアイテムのプロパティ
 */
type InstructorListItemProps = {
  /** インストラクター情報 */
  instructor: FormattedInstructor;
  /** 選択状態 */
  isSelected: boolean;
  /** トグルハンドラー */
  onToggle: (id: number) => void;
};

/**
 * インストラクターリストアイテムコンポーネント
 *
 * @description
 * サーバー側でフォーマット済みのインストラクター情報を表示。
 * API層で資格ありのインストラクターのみにフィルタリング済みのため、
 * 資格情報は常に存在します。
 *
 * @param props - コンポーネントプロパティ
 */
export function InstructorListItem({
  instructor,
  isSelected,
  onToggle,
}: InstructorListItemProps) {
  return (
    <button
      className={cn(
        "flex cursor-pointer items-center justify-between p-3 transition-all duration-200",
        "border-gray-100 border-b last:border-b-0 hover:bg-blue-50 dark:border-gray-800 dark:hover:bg-blue-950",
        isSelected &&
          "border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-950"
      )}
      onClick={() => onToggle(instructor.id)}
      type="button"
    >
      <div className="flex items-center space-x-3">
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
            isSelected
              ? "scale-110 border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-500"
              : "border-gray-300 hover:border-blue-300 dark:border-gray-500 dark:hover:border-blue-400"
          )}
        >
          {isSelected ? (
            <Check className="h-3 w-3" weight="bold" />
          ) : (
            <div className="h-2 w-2 rounded-full bg-transparent" />
          )}
        </div>
        <div>
          <div className="font-medium text-sm">{instructor.displayName}</div>
          <div className="text-muted-foreground text-xs">
            {instructor.displayNameKana}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="rounded-full border border-blue-200 bg-blue-100 px-2 py-1 text-blue-800 text-xs dark:border-blue-700 dark:bg-blue-900 dark:text-blue-100">
          {instructor.certificationSummary}
        </div>
      </div>
    </button>
  );
}
