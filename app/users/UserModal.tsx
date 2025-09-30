"use client";

import { Trash, UserGear } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { getRoleDisplayName } from "./api";
import type { UserFormData, UserRole, UserWithDetails } from "./types";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithDetails | null;
  onSave: (data: UserFormData) => Promise<void>;
  onDeactivate?: (user: UserWithDetails) => Promise<void>;
}

export default function UserModal({
  isOpen,
  onClose,
  user,
  onSave,
  onDeactivate,
}: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    displayName: "",
    role: "MEMBER",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ユーザー情報をフォームに設定
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName,
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setFormData({
        displayName: "",
        role: "MEMBER",
        isActive: true,
      });
    }
    setError(null);
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.displayName.trim()) {
      setError("表示名を入力してください");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await onSave(formData);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "ユーザー情報の更新に失敗しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value as UserRole });
  };

  const handleDeactivate = async () => {
    if (!(user && onDeactivate)) return;

    if (
      window.confirm(
        `${user.displayName}を無効化しますか？\nこの操作は取り消せません。`
      )
    ) {
      try {
        setIsSubmitting(true);
        setError(null);
        await onDeactivate(user);
        onClose();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "ユーザーの無効化に失敗しました"
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Drawer onOpenChange={handleClose} open={isOpen}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-7xl">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2 text-2xl">
              <UserGear className="h-6 w-6" weight="regular" />
              ユーザー詳細・編集
            </DrawerTitle>
          </DrawerHeader>

          <ScrollArea className="h-auto max-h-[60vh] overflow-auto overflow-y-auto p-4">
            <form className="space-y-6" id="user-form" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-destructive/15 p-3">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              {/* 表示名 */}
              <div className="space-y-2">
                <Label className="font-medium text-sm" htmlFor="displayName">
                  表示名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="displayName"
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  placeholder="ユーザーの表示名を入力"
                  required
                  value={formData.displayName}
                />
              </div>

              {/* 権限ロール */}
              <div className="space-y-3">
                <Label className="font-medium text-sm">
                  権限ロール <span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  onValueChange={handleRoleChange}
                  value={formData.role}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="member" value="MEMBER" />
                    <Label className="cursor-pointer" htmlFor="member">
                      {getRoleDisplayName("MEMBER")} - 基本権限
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="manager" value="MANAGER" />
                    <Label className="cursor-pointer" htmlFor="manager">
                      {getRoleDisplayName("MANAGER")} - シフト管理権限
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="admin" value="ADMIN" />
                    <Label className="cursor-pointer" htmlFor="admin">
                      {getRoleDisplayName("ADMIN")} - 全権限
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* アクティブ状態 */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-medium text-sm" htmlFor="isActive">
                    アクティブ状態
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    無効化されたユーザーはログインできません
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  id="isActive"
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
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
                disabled={isSubmitting || !formData.displayName.trim()}
                form="user-form"
                type="submit"
              >
                {isSubmitting ? "保存中..." : "保存"}
              </Button>

              {/* 無効化ボタン（管理者以外のアクティブユーザーのみ） */}
              {user &&
                user.isActive &&
                user.role !== "ADMIN" &&
                onDeactivate && (
                  <Button
                    className="flex-1"
                    disabled={isSubmitting}
                    onClick={handleDeactivate}
                    type="button"
                    variant="destructive"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        無効化中...
                      </>
                    ) : (
                      <>
                        <Trash className="mr-2 h-4 w-4" weight="regular" />
                        無効化
                      </>
                    )}
                  </Button>
                )}
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
