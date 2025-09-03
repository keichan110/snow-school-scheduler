'use client';

import { useState, useEffect } from 'react';
import { Plus, Info, Calendar, Clock, Trash, Eye } from '@phosphor-icons/react';
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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { format, addDays, addMonths } from 'date-fns';
import type { InvitationFormData, InvitationTokenWithStats } from './types';

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InvitationFormData) => Promise<void>;
  invitation?: InvitationTokenWithStats | null;
  onDeactivate?: (token: string) => Promise<void>;
}

export default function InvitationModal({
  isOpen,
  onClose,
  onSave,
  invitation,
  onDeactivate,
}: InvitationModalProps) {
  const [formData, setFormData] = useState<InvitationFormData>({
    description: '',
    expiresAt: addDays(new Date(), 7), // デフォルト1週間
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!invitation;

  // 編集モードの場合は招待データで初期化
  useEffect(() => {
    if (invitation) {
      setFormData({
        description: invitation.description || '',
        expiresAt: invitation.expiresAt ? new Date(invitation.expiresAt) : addDays(new Date(), 7),
      });
    } else {
      setFormData({
        description: '',
        expiresAt: addDays(new Date(), 7),
      });
    }
    setError(null);
  }, [invitation]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // 編集モードでは新規作成を無効化
    if (isEditing) {
      setError('編集モードでは新しい招待を作成できません');
      return;
    }

    if (!formData.description.trim()) {
      setError('説明を入力してください');
      return;
    }

    // 有効期限のバリデーション（最大1ヶ月）
    const maxExpiryDate = addMonths(new Date(), 1);
    if (formData.expiresAt > maxExpiryDate) {
      setError('有効期限は最大1ヶ月までです');
      return;
    }

    if (formData.expiresAt <= new Date()) {
      setError('有効期限は現在時刻より後に設定してください');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await onSave(formData);

      setFormData({
        description: '',
        expiresAt: addDays(new Date(), 7), // デフォルト1週間
      });

      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : '招待の作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!invitation || !onDeactivate) return;

    if (window.confirm('この招待を無効化しますか？\nこの操作は取り消せません。')) {
      try {
        setIsSubmitting(true);
        setError(null);
        await onDeactivate(invitation.token);
        onClose();
      } catch (error) {
        setError(error instanceof Error ? error.message : '招待の無効化に失敗しました');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      description: '',
      expiresAt: addDays(new Date(), 7), // デフォルト1週間
    });
    setError(null);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-7xl">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2 text-2xl">
              {isEditing ? (
                <>
                  <Eye className="h-6 w-6" weight="regular" />
                  招待詳細
                </>
              ) : (
                <>
                  <Plus className="h-6 w-6" weight="regular" />
                  新規招待作成
                </>
              )}
            </DrawerTitle>
          </DrawerHeader>

          <ScrollArea className="h-auto max-h-[60vh] overflow-auto overflow-y-auto p-4">
            <form id="invitation-form" onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* 基本情報 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Info className="h-4 w-4" weight="regular" />
                  招待情報
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      説明 <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={
                        isEditing
                          ? undefined
                          : (e) => setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder={isEditing ? '' : '招待の目的や対象者を記入してください'}
                      required={!isEditing}
                      rows={3}
                      className="resize-none"
                      readOnly={isEditing}
                    />
                    <p className="text-xs text-muted-foreground">
                      この招待が何のためのものかを分かりやすく記述してください
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 有効期限設定 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" weight="regular" />
                  有効期限設定
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt" className="text-sm font-medium">
                      有効期限 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="expiresAt"
                      type="date"
                      value={format(formData.expiresAt, 'yyyy-MM-dd')}
                      onChange={
                        isEditing
                          ? undefined
                          : (e) => {
                              const date = new Date(e.target.value);
                              setFormData({ ...formData, expiresAt: date });
                            }
                      }
                      min={isEditing ? undefined : format(new Date(), 'yyyy-MM-dd')}
                      max={isEditing ? undefined : format(addMonths(new Date(), 1), 'yyyy-MM-dd')}
                      required={!isEditing}
                      className="w-full"
                      readOnly={isEditing}
                    />
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      最大1ヶ月まで設定可能です
                    </div>
                  </div>

                  {/* 期限の詳細表示 */}
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/20">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-orange-900 dark:text-orange-100">
                        <Clock className="h-4 w-4" weight="regular" />
                        有効期限
                      </div>
                      <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                        {format(formData.expiresAt, 'yyyy年MM月dd日')} 23:59まで
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 注意事項 */}
              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                    <Info className="h-4 w-4" weight="regular" />
                    招待URLについて
                  </h4>
                  <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                    <li>• 使用回数に制限はありません（期間内であれば何度でも使用可能）</li>
                    <li>• 有効期限を過ぎると自動的に無効になります</li>
                    <li>• 管理者が手動で無効化することも可能です</li>
                    <li>• 招待URLは作成後にコピーできます</li>
                  </ul>
                </div>
              </div>
            </form>
          </ScrollArea>

          <DrawerFooter>
            <div className="flex w-full gap-2">
              <DrawerClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting} className="flex-1">
                  {isEditing ? '閉じる' : 'キャンセル'}
                </Button>
              </DrawerClose>

              {isEditing ? (
                // 編集モード：削除ボタンのみ表示
                invitation &&
                invitation.isActive && (
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
                )
              ) : (
                // 新規作成モード：作成ボタン表示
                <Button
                  type="submit"
                  form="invitation-form"
                  disabled={isSubmitting || !formData.description.trim()}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      作成中...
                    </>
                  ) : (
                    '作成'
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
