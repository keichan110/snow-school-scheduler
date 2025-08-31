'use client';

import { useState, useEffect } from 'react';
import { UserGear } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getRoleDisplayName } from './api';
import type { UserWithDetails, UserFormData, UserRole } from './types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithDetails | null;
  onSave: (data: UserFormData) => Promise<void>;
}

export default function UserModal({ isOpen, onClose, user, onSave }: UserModalProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserGear className="h-5 w-5" />
            {user ? 'ユーザー編集' : '新規ユーザー'}
          </DialogTitle>
          <DialogDescription>
            {user ? 'ユーザー情報を編集します' : '新しいユーザーを作成します'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* 表示名 */}
          <div className="space-y-2">
            <Label htmlFor="displayName">表示名 *</Label>
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
            <Label>権限ロール *</Label>
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
              <Label htmlFor="isActive">アクティブ状態</Label>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
