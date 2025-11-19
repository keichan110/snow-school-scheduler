"use client";

import { CalendarX, Info, Warning } from "@phosphor-icons/react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { InvitationTokenWithStats } from "../_lib/types";

type InvitationWarningModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  existingInvitation: InvitationTokenWithStats;
  isSubmitting?: boolean;
  error?: string | null;
};

export default function InvitationWarningModal({
  isOpen,
  onClose,
  onConfirm,
  existingInvitation,
  isSubmitting = false,
  error = null,
}: InvitationWarningModalProps) {
  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <Warning className="h-6 w-6" weight="fill" />
            既存の招待を置き換えますか？
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-950/20">
            <div className="flex items-start gap-3">
              <Info
                className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400"
                weight="regular"
              />
              <div className="text-amber-800 text-sm dark:text-amber-200">
                <p className="mb-1 font-medium">現在有効な招待があります</p>
                <p>
                  新しい招待を作成すると、既存の有効な招待は自動的に無効化されます。
                  無効化された招待URLは使用できなくなります。
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium text-muted-foreground text-sm">
              無効化される招待
            </h4>

            <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800/50">
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {existingInvitation.description || "説明なし"}
                  </p>
                </div>

                <div className="flex items-center justify-between text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarX className="h-4 w-4" weight="regular" />
                    <span>有効期限</span>
                  </div>
                  <span>
                    {existingInvitation.expiresAt
                      ? format(
                          new Date(existingInvitation.expiresAt),
                          "MM月dd日 HH:mm",
                          {
                            locale: ja,
                          }
                        )
                      : "なし"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground text-sm">
                  <span>使用回数</span>
                  <span className="font-mono">
                    {existingInvitation.usageCount || 0}回
                  </span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground text-sm">
                  <span>作成者</span>
                  <span>{existingInvitation.createdBy}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
            <h4 className="mb-2 flex items-center gap-2 font-medium text-red-900 text-sm dark:text-red-100">
              <Warning className="h-4 w-4" weight="regular" />
              ご注意
            </h4>
            <ul className="space-y-1 text-red-800 text-xs dark:text-red-200">
              <li>• 既存の招待URLは即座に使用できなくなります</li>
              <li>• この操作は取り消すことができません</li>
              <li>• 既に配布されたURLを持つ方は新しいURLが必要になります</li>
            </ul>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
              <div className="flex items-start gap-3">
                <Warning
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
                  weight="fill"
                />
                <div className="text-red-800 text-sm dark:text-red-200">
                  <p className="mb-1 font-medium">エラーが発生しました</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={isSubmitting}
              onClick={onClose}
              variant="outline"
            >
              キャンセル
            </Button>
            <Button
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              disabled={isSubmitting}
              onClick={onConfirm}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  作成中...
                </>
              ) : (
                "置き換えて作成"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
