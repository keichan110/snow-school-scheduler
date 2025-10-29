"use client";

import { Award, User } from "lucide-react";
import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { unlinkMyInstructor } from "@/lib/actions/user-instructor-linkage";
import type { UserInstructorProfile } from "@/types/actions";

type InstructorProfileCardProps = {
  instructor: UserInstructorProfile;
  onUnlink: () => void;
};

export function InstructorProfileCard({
  instructor,
  onUnlink,
}: InstructorProfileCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUnlinkConfirm = () => {
    startTransition(async () => {
      const result = await unlinkMyInstructor();

      if (result.success) {
        setShowUnlinkDialog(false);
        onUnlink();
      } else {
        setErrorMessage(result.error);
      }
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            マイインストラクター情報
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="font-bold text-lg">
              {instructor.lastName} {instructor.firstName}
            </div>
            {instructor.lastNameKana && (
              <div className="text-muted-foreground text-sm">
                {instructor.lastNameKana} {instructor.firstNameKana}
              </div>
            )}
          </div>

          {instructor.certifications.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 font-medium text-sm">
                <Award className="h-4 w-4" />
                保有資格
              </div>
              <div className="flex flex-wrap gap-2">
                {instructor.certifications.map((cert) => (
                  <Badge key={cert.id} variant="secondary">
                    {cert.shortName}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
              {errorMessage}
            </div>
          )}

          <Button
            className="w-full"
            disabled={isPending}
            onClick={() => setShowUnlinkDialog(true)}
            variant="outline"
          >
            紐付け解除
          </Button>
        </CardContent>
      </Card>

      <AlertDialog onOpenChange={setShowUnlinkDialog} open={showUnlinkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>紐付けを解除しますか?</AlertDialogTitle>
            <AlertDialogDescription>
              インストラクター情報の紐付けを解除します。この操作は後から再設定できます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={handleUnlinkConfirm}
            >
              {isPending ? "解除中..." : "解除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
