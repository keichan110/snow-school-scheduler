"use client";

import {
  Calendar,
  PersonSimpleSki,
  PersonSimpleSnowboard,
} from "@phosphor-icons/react";

type DepartmentIconProps = {
  type: "ski" | "snowboard" | "mixed";
  className?: string;
};

/**
 * 部門タイプに応じたアイコンを表示するクライアントコンポーネント
 *
 * @description
 * Phosphor Iconsを使用するため、このコンポーネントのみ "use client" を指定
 * 親コンポーネント(ShiftCard)はサーバーコンポーネントのまま動作可能
 */
export function DepartmentIcon({
  type,
  className = "h-3.5 w-3.5",
}: DepartmentIconProps) {
  switch (type) {
    case "ski":
      return <PersonSimpleSki className={className} weight="fill" />;
    case "snowboard":
      return <PersonSimpleSnowboard className={className} weight="fill" />;
    default:
      return null;
  }
}
