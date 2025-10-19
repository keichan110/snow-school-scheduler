"use client";

import { getDepartmentIcon } from "@/app/(member)/shifts/utils/shift-components";
import { cn } from "@/lib/utils";
import { DEPARTMENT_STYLES } from "../constants/shift-constants";
import type { Department, DepartmentType } from "../types";

type DepartmentSelectorProps = {
  departments: Department[];
  selectedId: number;
  onSelect: (id: number) => void;
  error?: string | undefined;
  isLoading?: boolean;
};

// 部門名から部門タイプを判定
function getDepartmentTypeFromName(name: string): DepartmentType {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("スキー") || lowerName.includes("ski")) {
    return "ski";
  }
  if (lowerName.includes("スノーボード") || lowerName.includes("snowboard")) {
    return "snowboard";
  }
  return "mixed";
}

export function DepartmentSelector({
  departments,
  selectedId,
  onSelect,
  error,
  isLoading = false,
}: DepartmentSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="font-medium text-sm">
        部門 <span className="text-red-500">*</span>
      </div>
      {isLoading ? (
        <div className="text-muted-foreground text-sm">読み込み中...</div>
      ) : (
        <div className="flex gap-4">
          {departments.map((department) => {
            const departmentType = getDepartmentTypeFromName(department.name);
            const styles = DEPARTMENT_STYLES[departmentType];
            const isSelected = selectedId === department.id;
            const iconElement = getDepartmentIcon(
              departmentType,
              cn("h-5 w-5", styles.iconColor)
            );

            return (
              <button
                className={cn(
                  "flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all duration-200 hover:bg-accent",
                  isSelected
                    ? `${styles.sectionBorderClass} ${styles.sectionBgClass}`
                    : "border-gray-200 hover:border-gray-300"
                )}
                key={department.id}
                onClick={() => onSelect(department.id)}
                type="button"
              >
                {iconElement}
                <span
                  className={cn(
                    "font-medium",
                    isSelected ? styles.sectionTextClass : "text-gray-600"
                  )}
                >
                  {department.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
