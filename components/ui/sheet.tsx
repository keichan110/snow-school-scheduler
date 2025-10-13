"use client";

import {
  Close as SheetPrimitiveClose,
  Content as SheetPrimitiveContent,
  Description as SheetPrimitiveDescription,
  Overlay as SheetPrimitiveOverlay,
  Portal as SheetPrimitivePortal,
  Root as SheetPrimitiveRoot,
  Title as SheetPrimitiveTitle,
  Trigger as SheetPrimitiveTrigger,
} from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
  type HTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

const Sheet = SheetPrimitiveRoot;

const SheetTrigger = SheetPrimitiveTrigger;

const SheetClose = SheetPrimitiveClose;

const SheetPortal = SheetPrimitivePortal;

const SheetOverlay = forwardRef<
  ElementRef<typeof SheetPrimitiveOverlay>,
  ComponentPropsWithoutRef<typeof SheetPrimitiveOverlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitiveOverlay
    className={cn(
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=open]:animate-in",
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitiveOverlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 border-b",
        bottom:
          "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 border-t",
        left: "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
        right:
          "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

interface SheetContentProps
  extends ComponentPropsWithoutRef<typeof SheetPrimitiveContent>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = forwardRef<
  ElementRef<typeof SheetPrimitiveContent>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitiveContent
      className={cn(sheetVariants({ side }), className)}
      ref={ref}
      {...props}
    >
      <SheetPrimitiveClose className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitiveClose>
      {children}
    </SheetPrimitiveContent>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitiveContent.displayName;

const SheetHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = forwardRef<
  ElementRef<typeof SheetPrimitiveTitle>,
  ComponentPropsWithoutRef<typeof SheetPrimitiveTitle>
>(({ className, ...props }, ref) => (
  <SheetPrimitiveTitle
    className={cn("font-semibold text-foreground text-lg", className)}
    ref={ref}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitiveTitle.displayName;

const SheetDescription = forwardRef<
  ElementRef<typeof SheetPrimitiveDescription>,
  ComponentPropsWithoutRef<typeof SheetPrimitiveDescription>
>(({ className, ...props }, ref) => (
  <SheetPrimitiveDescription
    className={cn("text-muted-foreground text-sm", className)}
    ref={ref}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitiveDescription.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
