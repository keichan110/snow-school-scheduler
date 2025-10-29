"use client";

import { useRouter } from "next/navigation";
import type {
  InstructorBasicInfo,
  UserInstructorProfile,
} from "@/types/actions";
import { InstructorLinkageButton } from "./instructor-linkage-button";
import { InstructorProfileCard } from "./instructor-profile-card";

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

  if (instructorProfile) {
    return (
      <InstructorProfileCard
        instructor={instructorProfile}
        onUnlink={handleSuccess}
      />
    );
  }

  return (
    <InstructorLinkageButton
      instructors={availableInstructors}
      onSuccess={handleSuccess}
    />
  );
}
