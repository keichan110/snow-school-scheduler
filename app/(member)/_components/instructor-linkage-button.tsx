"use client";

import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { InstructorBasicInfo } from "@/types/actions";
import { InstructorSelectModal } from "./instructor-select-modal";

type InstructorLinkageButtonProps = {
  instructors: InstructorBasicInfo[];
  onSuccess: () => void;
};

export function InstructorLinkageButton({
  instructors,
  onSuccess,
}: InstructorLinkageButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button className="gap-2" onClick={() => setModalOpen(true)}>
        <UserPlus className="h-4 w-4" />
        インストラクター情報を設定
      </Button>

      <InstructorSelectModal
        instructors={instructors}
        onOpenChange={setModalOpen}
        onSuccess={onSuccess}
        open={modalOpen}
      />
    </>
  );
}
