'use client';

import { useState, useEffect } from 'react';
import { UserGear, Trash } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getRoleDisplayName } from './api';
import type { UserWithDetails, UserFormData, UserRole } from './types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithDetails | null;
  onSave: (data: UserFormData) => Promise<void>;
  onDeactivate?: (user: UserWithDetails) => Promise<void>;
}

export default function UserModal({ isOpen, onClose, user, onSave, onDeactivate }: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    displayName: '',
    role: 'MEMBER',
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
        displayName: '',
        role: 'MEMBER',
        isActive: true,
      });
    }
    setError(null);
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.displayName.trim()) {
      setError('表示名を入力してください');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await onSave(formData);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ユーザー情報の更新に失敗しました');
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
    if (!user || !onDeactivate) return;

    if (window.confirm(`${user.displayName}を無効化しますか？\nこの操作は取り消せません。`)) {
      try {
        setIsSubmitting(true);
        setError(null);
        await onDeactivate(user);
        onClose();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'ユーザーの無効化に失敗しました');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-7xl">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2 text-2xl">
              <UserGear className="h-6 w-6" weight="regular" />
              ユーザー詳細・編集
            </DrawerTitle>
          </DrawerHeader>

          <ScrollArea className="h-auto max-h-[60vh] overflow-auto overflow-y-auto p-4">
            <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* 表示名 */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-medium">
                  表示名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="ユーザーの表示名を入力"
                  required
                />
              </div>

              {/* 権限ロール */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  権限ロール <span className="text-destructive">*</span>
                </Label>
                <RadioGroup value={formData.role} onValueChange={handleRoleChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MEMBER" id="member" />
                    <Label htmlFor="member" className="cursor-pointer">
                      {getRoleDisplayName('MEMBER')} - 基本権限
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MANAGER" id="manager" />
                    <Label htmlFor="manager" className="cursor-pointer">
                      {getRoleDisplayName('MANAGER')} - シフト管理権限
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ADMIN" id="admin" />
                    <Label htmlFor="admin" className="cursor-pointer">
                      {getRoleDisplayName('ADMIN')} - 全権限
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* アクティブ状態 */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" className="text-sm font-medium">
                    アクティブ状態
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    無効化されたユーザーはログインできません
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </form>
          </ScrollArea>

          <DrawerFooter>
            <div className="flex w-full gap-2">
              <DrawerClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting} className="flex-1">
                  キャンセル
                </Button>
              </DrawerClose>

              <Button
                type="submit"
                form="user-form"
                disabled={isSubmitting || !formData.displayName.trim()}
                className="flex-1"
              >
                {isSubmitting ? '保存中...' : '保存'}
              </Button>

              {/* 無効化ボタン（管理者以外のアクティブユーザーのみ） */}
              {user && user.isActive && user.role !== 'ADMIN' && onDeactivate && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeactivate}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
