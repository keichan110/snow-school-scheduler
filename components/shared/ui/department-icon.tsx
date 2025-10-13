"use client";

import {
  Calendar,
  PersonSimpleSki,
  PersonSimpleSnowboard,
} from "@phosphor-icons/react";
import type { DepartmentType } from "@/app/shifts/components/types";

type DepartmentIconProps = {
  department: DepartmentType;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function DepartmentIcon({
  department,
  className = "",
  size = "sm",
}: DepartmentIconProps) {
  const iconClass = `${sizeClasses[size]} text-foreground ${className}`;

  switch (department) {
    case "ski":
      return <PersonSimpleSki className={iconClass} weight="fill" />;
    case "snowboard":
      return <PersonSimpleSnowboard className={iconClass} weight="fill" />;
    case "mixed":
      return <Calendar className={iconClass} weight="fill" />;
    default:
      return <Calendar className={iconClass} weight="fill" />;
  }
}
