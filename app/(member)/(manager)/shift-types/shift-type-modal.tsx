"use client";

import { Tag } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useNotification } from "@/components/notifications";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import type { ShiftTypeFormData, ShiftTypeModalProps } from "./types";

export default function ShiftTypeModal({
  isOpen,
  onClose,
  shiftType,
  onSave,
}: ShiftTypeModalProps) {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState<ShiftTypeFormData>({
    name: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (shiftType) {
      // 編集モード
      setFormData({
        name: shiftType.name,
        isActive: shiftType.isActive,
      });
    } else {
      // 新規追加モード
      setFormData({
        name: "",
        isActive: true,
      });
    }
  }, [shiftType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave(formData);
      showNotification(
        shiftType
          ? "シフト種類が正常に更新されました"
          : "シフト種類が正常に作成されました",
        "success"
      );
      onClose();
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "保存に失敗しました",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer onOpenChange={onClose} open={isOpen}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-7xl">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2 text-2xl">
              <Tag className="h-6 w-6" weight="regular" />
              {shiftType ? "シフト種類編集" : "新しいシフト種類を追加"}
            </DrawerTitle>
          </DrawerHeader>

          <ScrollArea className="h-auto max-h-[60vh] overflow-auto overflow-y-auto p-4">
            <form
              className="space-y-6"
              id="shift-type-form"
              onSubmit={handleSubmit}
            >
              {/* 基本情報セクション */}
              <div className="space-y-4">
                {/* シフト種類名 */}
                <div className="space-y-2">
                  <Label className="font-medium text-sm" htmlFor="name">
                    シフト種類名 <span className="text-destructive">*</span>
                  </Label>
                  <div className="max-w-md">
                    <Input
                      id="name"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="例: 午前レッスン"
                      required
                      value={formData.name}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    シフト種類の名前を入力してください
                  </p>
                </div>

                {/* 有効/無効の設定 */}
                <div className="space-y-2">
                  <Label className="font-medium text-sm">有効</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: checked,
                        }))
                      }
                    />
                    <Label className="text-muted-foreground text-sm">
                      {formData.isActive ? "有効" : "無効"}
                    </Label>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    無効にしたシフト種類は新規割り当てができなくなります
                  </p>
                </div>
              </div>
            </form>
          </ScrollArea>

          <DrawerFooter>
            <div className="flex w-full gap-2">
              <DrawerClose asChild>
                <Button
                  className="flex-1"
                  disabled={isSubmitting}
                  type="button"
                  variant="outline"
                >
                  キャンセル
                </Button>
              </DrawerClose>
              <Button
                className="flex-1"
                disabled={isSubmitting}
                form="shift-type-form"
                type="submit"
              >
                {isSubmitting ? "保存中..." : "保存"}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
