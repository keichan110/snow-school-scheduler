"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { InstructorBasicInfo } from "@/types/actions";
import { InstructorSelectModal } from "./instructor-select-modal";

type InstructorLinkageButtonProps = {
  instructors: InstructorBasicInfo[];
  onSuccessAction: () => void;
};

export function InstructorLinkageButton({
  instructors,
  onSuccessAction,
}: InstructorLinkageButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        className="gap-2"
        onClick={() => setModalOpen(true)}
        variant="outline"
      >
        設定
      </Button>

      <InstructorSelectModal
        instructors={instructors}
        onOpenChange={setModalOpen}
        onSuccess={onSuccessAction}
        open={modalOpen}
      />
    </>
  );
}
