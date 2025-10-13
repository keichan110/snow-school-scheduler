"use client";

import {
  Fallback as AvatarFallback,
  Image as AvatarImage,
  Root as AvatarRoot,
} from "@radix-ui/react-avatar";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from "react";

import { cn } from "@/lib/utils";

const Avatar = forwardRef<
  ElementRef<typeof AvatarRoot>,
  ComponentPropsWithoutRef<typeof AvatarRoot>
>(({ className, ...props }, ref) => (
  <AvatarRoot
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    ref={ref}
    {...props}
  />
));
Avatar.displayName = AvatarRoot.displayName;

const AvatarImageComponent = forwardRef<
  ElementRef<typeof AvatarImage>,
  ComponentPropsWithoutRef<typeof AvatarImage>
>(({ className, ...props }, ref) => (
  <AvatarImage
    className={cn("aspect-square h-full w-full", className)}
    ref={ref}
    {...props}
  />
));
AvatarImageComponent.displayName = AvatarImage.displayName;

const AvatarFallbackComponent = forwardRef<
  ElementRef<typeof AvatarFallback>,
  ComponentPropsWithoutRef<typeof AvatarFallback>
>(({ className, ...props }, ref) => (
  <AvatarFallback
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    ref={ref}
    {...props}
  />
));
AvatarFallbackComponent.displayName = AvatarFallback.displayName;

export {
  Avatar,
  AvatarImageComponent as AvatarImage,
  AvatarFallbackComponent as AvatarFallback,
};
