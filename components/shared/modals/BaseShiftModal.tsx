"use client";

import { Calendar } from "@phosphor-icons/react";
import type React from "react";
import type { DayData } from "@/app/shifts/types";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { formatDateForDisplay } from "@/shared/utils/dateFormatter";

export interface BaseShiftModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string | null;
  dayData: DayData | null;
  variant: "admin" | "public";
  children?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
  showEmptyState?: boolean;
  emptyStateContent?: React.ReactNode;
}

export function BaseShiftModal({
  isOpen,
  onOpenChange,
  selectedDate,
  dayData,
  variant,
  children,
  footer,
  title,
  showEmptyState = true,
  emptyStateContent,
}: BaseShiftModalProps) {
  if (!selectedDate) return null;

  const formattedDate = formatDateForDisplay(selectedDate);
  const displayTitle = title || formattedDate;

  // シフトなしの場合の共通表示
  const renderEmptyState = () => (
    <div className="py-8 text-center text-muted-foreground">
      <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
      <div className="font-medium text-lg">シフトが設定されていません</div>
      <div className="mt-1 text-sm">この日はシフトの設定がありません</div>
    </div>
  );

  // デフォルトフッター（公開側）
  const renderDefaultFooter = () => (
    <div className="border-t bg-background px-4 py-4">
      <DrawerClose asChild>
        <Button className="w-full" size="lg" variant="outline">
          閉じる
        </Button>
      </DrawerClose>
    </div>
  );

  return (
    <Drawer onOpenChange={onOpenChange} open={isOpen}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="pb-2 text-center">
          <DrawerTitle className="flex items-center justify-center gap-2 text-xl md:text-2xl">
            {displayTitle}
          </DrawerTitle>
          <DrawerDescription>
            選択した日のシフト情報を表示しています
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-4">
          <div className="space-y-4">
            {showEmptyState && (!dayData || dayData.shifts.length === 0)
              ? emptyStateContent || renderEmptyState()
              : children}
          </div>
        </div>

        {footer || (variant === "public" && renderDefaultFooter())}
      </DrawerContent>
    </Drawer>
  );
}

// Variant別の便利コンポーネント
export interface PublicShiftModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string | null;
  dayData: DayData | null;
  children?: React.ReactNode;
  title?: string;
}

export function PublicShiftModal(props: PublicShiftModalProps) {
  return <BaseShiftModal {...props} variant="public" />;
}

export interface AdminShiftModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string | null;
  dayData: DayData | null;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
  showEmptyState?: boolean;
  emptyStateContent?: React.ReactNode;
}

export function AdminShiftModal(props: AdminShiftModalProps) {
  return <BaseShiftModal {...props} variant="admin" />;
}
