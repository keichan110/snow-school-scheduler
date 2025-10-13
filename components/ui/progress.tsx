"use client";

import {
  Indicator as ProgressPrimitiveIndicator,
  Root as ProgressPrimitiveRoot,
} from "@radix-ui/react-progress";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from "react";

import { cn } from "@/lib/utils";

const PROGRESS_MAX_PERCENT = 100;

const Progress = forwardRef<
  ElementRef<typeof ProgressPrimitiveRoot>,
  ComponentPropsWithoutRef<typeof ProgressPrimitiveRoot>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitiveRoot
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    )}
    ref={ref}
    {...props}
  >
    <ProgressPrimitiveIndicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{
        transform: `translateX(-${PROGRESS_MAX_PERCENT - (value || 0)}%)`,
      }}
    />
  </ProgressPrimitiveRoot>
));
Progress.displayName = ProgressPrimitiveRoot.displayName;

export { Progress };
