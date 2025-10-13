"use client";

import {
  Corner as ScrollAreaPrimitiveCorner,
  Root as ScrollAreaPrimitiveRoot,
  Viewport as ScrollAreaPrimitiveViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
} from "@radix-ui/react-scroll-area";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from "react";

import { cn } from "@/lib/utils";

const ScrollArea = forwardRef<
  ElementRef<typeof ScrollAreaPrimitiveRoot>,
  ComponentPropsWithoutRef<typeof ScrollAreaPrimitiveRoot>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitiveRoot
    className={cn("relative overflow-hidden", className)}
    ref={ref}
    {...props}
  >
    <ScrollAreaPrimitiveViewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitiveViewport>
    <ScrollBar />
    <ScrollAreaPrimitiveCorner />
  </ScrollAreaPrimitiveRoot>
));
ScrollArea.displayName = ScrollAreaPrimitiveRoot.displayName;

const ScrollBar = forwardRef<
  ElementRef<typeof ScrollAreaScrollbar>,
  ComponentPropsWithoutRef<typeof ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaScrollbar
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    orientation={orientation}
    ref={ref}
    {...props}
  >
    <ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
