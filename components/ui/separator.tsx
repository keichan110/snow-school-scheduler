"use client";

import { Root as SeparatorPrimitiveRoot } from "@radix-ui/react-separator";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from "react";

import { cn } from "@/lib/utils";

const Separator = forwardRef<
  ElementRef<typeof SeparatorPrimitiveRoot>,
  ComponentPropsWithoutRef<typeof SeparatorPrimitiveRoot>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitiveRoot
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      decorative={decorative}
      orientation={orientation}
      ref={ref}
      {...props}
    />
  )
);
Separator.displayName = SeparatorPrimitiveRoot.displayName;

export { Separator };
