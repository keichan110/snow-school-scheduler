"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  linkMyInstructor,
  unlinkMyInstructor,
} from "@/lib/actions/user-instructor-linkage";
import type { InstructorBasicInfo } from "@/types/actions";

type InstructorSelectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructors: InstructorBasicInfo[];
  onSuccess: () => void;
  /** 現在紐づけられているインストラクターID (紐付け解除ボタンの表示制御に使用) */
  currentInstructorId?: number | null;
};

export function InstructorSelectModal({
  open,
  onOpenChange,
  instructors,
  onSuccess,
  currentInstructorId,
}: InstructorSelectModalProps) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // モーダルが開いたときに現在のインストラクターIDをセット
  useEffect(() => {
    if (open && currentInstructorId) {
      setSelectedId(currentInstructorId.toString());
    } else if (open && !currentInstructorId) {
      setSelectedId("");
    }
  }, [open, currentInstructorId]);

  const handleSubmit = () => {
    if (!selectedId) {
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const result = await linkMyInstructor(Number(selectedId));

      if (result.success) {
        onSuccess();
        onOpenChange(false);
        setSelectedId(""); // リセット
        setErrorMessage(null);
      } else {
        setErrorMessage(result.error);
      }
    });
  };

  const handleUnlink = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await unlinkMyInstructor();

      if (result.success) {
        onSuccess();
        onOpenChange(false);
        setSelectedId(""); // リセット
        setErrorMessage(null);
      } else {
        setErrorMessage(result.error);
      }
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>インストラクター情報の設定</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* インストラクター選択プルダウン */}
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="instructor-select">
              インストラクターを選択
            </label>
            <Select onValueChange={setSelectedId} value={selectedId}>
              <SelectTrigger id="instructor-select">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                {instructors.map((instructor) => (
                  <SelectItem
                    key={instructor.id}
                    value={instructor.id.toString()}
                  >
                    {instructor.lastName} {instructor.firstName}
                    {instructor.lastNameKana && (
                      <span className="text-muted-foreground text-sm">
                        {" "}
                        ({instructor.lastNameKana} {instructor.firstNameKana})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* エラーメッセージ */}
          {errorMessage && (
            <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
              {errorMessage}
            </div>
          )}

          {/* アクション */}
          <div className="flex items-center justify-between gap-2">
            {/* 紐付け解除ボタン (現在紐づけられている場合のみ表示) */}
            {currentInstructorId ? (
              <Button
                disabled={isPending}
                onClick={handleUnlink}
                variant="destructive"
              >
                {isPending ? "解除中..." : "紐付けを解除"}
              </Button>
            ) : (
              <div /> // スペーサー
            )}

            {/* キャンセル・保存ボタン */}
            <div className="flex gap-2">
              <Button
                disabled={isPending}
                onClick={() => {
                  onOpenChange(false);
                  setSelectedId(""); // リセット
                }}
                variant="outline"
              >
                キャンセル
              </Button>
              <Button
                disabled={!selectedId || isPending}
                onClick={handleSubmit}
              >
                {isPending ? "保存中..." : "保存"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
