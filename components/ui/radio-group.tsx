"use client";

import {
  Indicator as RadioGroupPrimitiveIndicator,
  Item as RadioGroupPrimitiveItem,
  Root as RadioGroupPrimitiveRoot,
} from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from "react";

import { cn } from "@/lib/utils";

const RadioGroup = forwardRef<
  ElementRef<typeof RadioGroupPrimitiveRoot>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitiveRoot>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitiveRoot
    className={cn("grid gap-2", className)}
    {...props}
    ref={ref}
  />
));
RadioGroup.displayName = RadioGroupPrimitiveRoot.displayName;

const RadioGroupItem = forwardRef<
  ElementRef<typeof RadioGroupPrimitiveItem>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitiveItem>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitiveItem
    className={cn(
      "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  >
    <RadioGroupPrimitiveIndicator className="flex items-center justify-center">
      <Circle className="h-3.5 w-3.5 fill-primary" />
    </RadioGroupPrimitiveIndicator>
  </RadioGroupPrimitiveItem>
));
RadioGroupItem.displayName = RadioGroupPrimitiveItem.displayName;

export { RadioGroup, RadioGroupItem };
