"use client";

import {
  Root as SwitchPrimitiveRoot,
  Thumb as SwitchPrimitiveThumb,
} from "@radix-ui/react-switch";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from "react";

import { cn } from "@/lib/utils";

const Switch = forwardRef<
  ElementRef<typeof SwitchPrimitiveRoot>,
  ComponentPropsWithoutRef<typeof SwitchPrimitiveRoot>
>(({ className, ...props }, ref) => (
  <SwitchPrimitiveRoot
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-gradient-to-r data-[state=unchecked]:bg-input data-[state=checked]:from-[#2D9CDB] data-[state=checked]:to-[#56CCF2] dark:data-[state=checked]:from-[#00FFC6] dark:data-[state=checked]:to-[#66FCF1]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitiveThumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitiveRoot>
));
Switch.displayName = SwitchPrimitiveRoot.displayName;

export { Switch };
