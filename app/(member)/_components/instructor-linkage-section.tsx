"use client";

import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type {
  InstructorBasicInfo,
  UserInstructorProfile,
} from "@/types/actions";
import { InstructorLinkageButton } from "./instructor-linkage-button";

type InstructorLinkageSectionProps = {
  instructorProfile: UserInstructorProfile | null;
  availableInstructors: InstructorBasicInfo[];
};

export function InstructorLinkageSection({
  instructorProfile,
  availableInstructors,
}: InstructorLinkageSectionProps) {
  const router = useRouter();

  const handleSuccess = () => {
    // ページをリフレッシュして最新データを取得
    router.refresh();
  };

  // インストラクターが紐づいている場合は何も表示しない
  if (instructorProfile) {
    return null;
  }

  return (
    <Alert className="flex items-center gap-4" variant="warning">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <div>
          <AlertTitle>インストラクター情報が設定されていません</AlertTitle>
          <AlertDescription>
            スケジュール機能を利用するには、インストラクター情報を設定してください。
          </AlertDescription>
        </div>
      </div>
      <div className="ml-auto">
        <InstructorLinkageButton
          instructors={availableInstructors}
          onSuccessAction={handleSuccess}
        />
      </div>
    </Alert>
  );
}
