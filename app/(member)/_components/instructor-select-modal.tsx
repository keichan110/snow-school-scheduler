"use client";

import { useState, useTransition } from "react";
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
import { linkMyInstructor } from "@/lib/actions/user-instructor-linkage";
import type { InstructorBasicInfo } from "@/types/actions";

type InstructorSelectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructors: InstructorBasicInfo[];
  onSuccess: () => void;
};

export function InstructorSelectModal({
  open,
  onOpenChange,
  instructors,
  onSuccess,
}: InstructorSelectModalProps) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          <div className="flex justify-end gap-2">
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
            <Button disabled={!selectedId || isPending} onClick={handleSubmit}>
              {isPending ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
