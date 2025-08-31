'use client';

import { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import type { InvitationFormData } from './types';

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InvitationFormData) => Promise<void>;
}

export default function InvitationModal({
  isOpen,
  onClose,
  onSave,
}: InvitationModalProps) {
  const [formData, setFormData] = useState<InvitationFormData>({
    description: '',
    maxUses: 1,
    expiresAt: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      setError('説明を入力してください');
      return;
    }

    if (formData.maxUses < 1) {
      setError('使用回数制限は1回以上である必要があります');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      await onSave(formData);
      
      setFormData({
        description: '',
        maxUses: 1,
        expiresAt: null,
      });
      
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : '招待の作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      description: '',
      maxUses: 1,
      expiresAt: null,
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            新規招待作成
          </DialogTitle>
          <DialogDescription>
            新しいメンバー招待用のURLを作成します
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">説明 *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="招待の目的や対象者を記入してください"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxUses">使用回数制限</Label>
            <Input
              id="maxUses"
              type="number"
              min="1"
              max="999"
              value={formData.maxUses}
              onChange={(e) =>
                setFormData({ ...formData, maxUses: parseInt(e.target.value) || 1 })
              }
            />
            <p className="text-xs text-muted-foreground">
              この招待URLで登録できる最大人数を設定します
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">有効期限（任意）</Label>
            <Input
              id="expiresAt"
              type="date"
              value={
                formData.expiresAt
                  ? format(formData.expiresAt, 'yyyy-MM-dd')
                  : ''
              }
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                setFormData({ ...formData, expiresAt: date });
              }}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
            <p className="text-xs text-muted-foreground">
              指定しない場合は無期限で有効です
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '作成中...' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}