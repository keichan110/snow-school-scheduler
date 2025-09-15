'use client';

import { useState, useEffect } from 'react';
import { Tag } from '@phosphor-icons/react';
import type { ShiftTypeModalProps, ShiftTypeFormData } from './types';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useNotification } from '@/components/notifications';

export default function ShiftTypeModal({
  isOpen,
  onClose,
  shiftType,
  onSave,
}: ShiftTypeModalProps) {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState<ShiftTypeFormData>({
    name: '',
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
        name: '',
        isActive: true,
      });
    }
  }, [shiftType, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave(formData);
      showNotification(
        shiftType ? 'シフト種類が正常に更新されました' : 'シフト種類が正常に作成されました',
        'success'
      );
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      showNotification(error instanceof Error ? error.message : '保存に失敗しました', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-7xl">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2 text-2xl">
              <Tag className="h-6 w-6" weight="regular" />
              {shiftType ? 'シフト種類編集' : '新しいシフト種類を追加'}
            </DrawerTitle>
          </DrawerHeader>

          <ScrollArea className="h-auto max-h-[60vh] overflow-auto overflow-y-auto p-4">
            <form id="shift-type-form" onSubmit={handleSubmit} className="space-y-6">
              {/* 基本情報セクション */}
              <div className="space-y-4">
                {/* シフト種類名 */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    シフト種類名 <span className="text-destructive">*</span>
                  </Label>
                  <div className="max-w-md">
                    <Input
                      id="name"
                      placeholder="例: 午前レッスン"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    シフト種類の名前を入力してください
                  </p>
                </div>

                {/* 有効/無効の設定 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">有効</Label>
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
                    <Label className="text-sm text-muted-foreground">
                      {formData.isActive ? '有効' : '無効'}
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    無効にしたシフト種類は新規割り当てができなくなります
                  </p>
                </div>
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
                form="shift-type-form"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? '保存中...' : '保存'}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
