"use client";

import {
  Content as TabsContent_,
  List as TabsList_,
  Root as TabsRoot,
  Trigger as TabsTrigger_,
} from "@radix-ui/react-tabs";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from "react";

import { cn } from "@/lib/utils";

const Tabs = TabsRoot;

const TabsList = forwardRef<
  ElementRef<typeof TabsList_>,
  ComponentPropsWithoutRef<typeof TabsList_>
>(({ className, ...props }, ref) => (
  <TabsList_
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    )}
    ref={ref}
    {...props}
  />
));
TabsList.displayName = TabsList_.displayName;

const TabsTrigger = forwardRef<
  ElementRef<typeof TabsTrigger_>,
  ComponentPropsWithoutRef<typeof TabsTrigger_>
>(({ className, ...props }, ref) => (
  <TabsTrigger_
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 font-medium text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    )}
    ref={ref}
    {...props}
  />
));
TabsTrigger.displayName = TabsTrigger_.displayName;

const TabsContent = forwardRef<
  ElementRef<typeof TabsContent_>,
  ComponentPropsWithoutRef<typeof TabsContent_>
>(({ className, ...props }, ref) => (
  <TabsContent_
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    ref={ref}
    {...props}
  />
));
TabsContent.displayName = TabsContent_.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
