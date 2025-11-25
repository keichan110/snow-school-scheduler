"use client";

import { PersonSimpleSki, PersonSimpleSnowboard } from "@phosphor-icons/react";

type DepartmentIconProps = {
  code: "ski" | "snowboard" | string;
  className?: string;
};

/**
 * 部門コードに応じたアイコンを表示するクライアントコンポーネント
 *
 * @description
 * Phosphor Iconsを使用するため、このコンポーネントのみ "use client" を指定
 * 親コンポーネント(ShiftCard)はサーバーコンポーネントのまま動作可能
 *
 * @param code - 部門コード (例: "SKI", "SNOWBOARD")
 */
export function DepartmentIcon({
  code,
  className = "h-3.5 w-3.5",
}: DepartmentIconProps) {
  const normalizedCode = code.toLowerCase();

  switch (normalizedCode) {
    case "ski":
      return (
        <PersonSimpleSki
          className={className}
          data-department="ski"
          data-testid="department-icon"
          weight="fill"
        />
      );
    case "snowboard":
      return (
        <PersonSimpleSnowboard
          className={className}
          data-department="snowboard"
          data-testid="department-icon"
          weight="fill"
        />
      );
    default:
      return null;
  }
}
