"use client";

import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

interface ShiftTypesErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ShiftTypesError({
  error,
  reset,
}: ShiftTypesErrorProps) {
  const { reset: resetQueryError } = useQueryErrorResetBoundary();

  useEffect(() => {
    console.error("Failed to render shift types page:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[320px] max-w-3xl flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <div className="space-y-2">
        <h2 className="font-semibold text-xl">
          シフト種類の読み込みに失敗しました
        </h2>
        <p className="text-muted-foreground text-sm">
          一時的な問題が発生しました。再試行しても解決しない場合は、管理者へお問い合わせください。
        </p>
      </div>
      <Button
        onClick={() => {
          resetQueryError();
          reset();
        }}
        variant="outline"
      >
        再試行
      </Button>
    </div>
  );
}
