'use client';

import { Warning, CalendarX, Info } from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { InvitationTokenWithStats } from './types';

interface InvitationWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  existingInvitation: InvitationTokenWithStats;
  isSubmitting?: boolean;
}

export default function InvitationWarningModal({
  isOpen,
  onClose,
  onConfirm,
  existingInvitation,
  isSubmitting = false,
}: InvitationWarningModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <Warning className="h-6 w-6" weight="fill" />
            既存の招待を置き換えますか？
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 警告メッセージ */}
          <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-950/20">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" weight="regular" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">現在有効な招待があります</p>
                <p>
                  新しい招待を作成すると、既存の有効な招待は自動的に無効化されます。
                  無効化された招待URLは使用できなくなります。
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* 既存招待の詳細 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">無効化される招待</h4>
            
            <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800/50">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {existingInvitation.description || '説明なし'}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarX className="h-4 w-4" weight="regular" />
                    <span>有効期限</span>
                  </div>
                  <span>
                    {existingInvitation.expiresAt 
                      ? format(new Date(existingInvitation.expiresAt), 'MM月dd日 HH:mm', { locale: ja })
                      : 'なし'
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>使用回数</span>
                  <span className="font-mono">
                    {existingInvitation.usageCount || 0}回
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>作成者</span>
                  <span>{existingInvitation.createdBy}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 注意事項 */}
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-red-900 dark:text-red-100">
              <Warning className="h-4 w-4" weight="regular" />
              ご注意
            </h4>
            <ul className="space-y-1 text-xs text-red-800 dark:text-red-200">
              <li>• 既存の招待URLは即座に使用できなくなります</li>
              <li>• この操作は取り消すことができません</li>
              <li>• 既に配布されたURLを持つ方は新しいURLが必要になります</li>
            </ul>
          </div>

          {/* アクション */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button 
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  作成中...
                </>
              ) : (
                '置き換えて作成'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}