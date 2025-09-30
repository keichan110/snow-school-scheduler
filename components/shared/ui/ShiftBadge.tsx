"use client";

import { cn } from "@/lib/utils";

interface ShiftBadgeProps {
  count: number;
  className?: string;
}

export function ShiftBadge({ count, className }: ShiftBadgeProps) {
  return (
    <span
      className={cn(
        "min-w-[1.5rem] rounded-full border border-border bg-background/90 px-2 py-1 text-center font-bold text-foreground text-xs shadow-sm",
        className
      )}
    >
      {count}
    </span>
  );
}
