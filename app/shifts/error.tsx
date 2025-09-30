"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Home, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useNotification } from "@/components/notifications";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  publicShiftsDepartmentsQueryKeys,
  publicShiftsQueryKeys,
} from "@/features/shifts/api/queries";

interface ShiftsErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function ShiftsError({ error, reset }: ShiftsErrorProps) {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);

  useEffect(() => {
    // SSR からの hydration mismatch を避けつつ、デバッグ情報を残す
    console.error("Shifts route error boundary:", error);
  }, [error]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setRetryMessage(null);

    try {
      await Promise.all([
        queryClient.invalidateQueries(
          { queryKey: publicShiftsQueryKeys.all, refetchType: "all" },
          { throwOnError: true }
        ),
        queryClient.invalidateQueries(
          {
            queryKey: publicShiftsDepartmentsQueryKeys.all,
            refetchType: "all",
          },
          { throwOnError: true }
        ),
      ]);

      showSuccess("最新のシフト情報を取得しました。");
      reset();
    } catch (refetchError) {
      console.error("Failed to recover shifts route:", refetchError);
      const message =
        refetchError instanceof Error
          ? refetchError.message
          : "シフト情報の再取得に失敗しました。時間をおいて再度お試しください。";
      setRetryMessage(message);
      showError("シフト情報の再取得に失敗しました。");
    } finally {
      setIsRetrying(false);
    }
  }, [queryClient, reset, showError, showSuccess]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-xl border border-destructive/30 bg-background/90 shadow-xl backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center sm:text-left">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive sm:mx-0">
            <AlertTriangle aria-hidden="true" className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="font-semibold text-lg sm:text-xl">
              シフト情報を読み込めませんでした
            </CardTitle>
            <p className="mt-1 text-muted-foreground text-sm">
              ネットワークまたはサーバーの問題が発生しています。再試行するか、時間をおいてから再度アクセスしてください。
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-muted bg-muted/40 p-3 text-muted-foreground text-sm">
            <p className="font-medium text-foreground">技術情報</p>
            <p className="mt-1 break-all">
              {error.message || "不明なエラーが発生しました。"}
              {error.digest ? ` (digest: ${error.digest})` : ""}
            </p>
          </div>
          {retryMessage && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-sm">
              {retryMessage}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button asChild className="w-full sm:w-auto" variant="outline">
            <Link href="/">
              <Home aria-hidden="true" className="mr-2 h-4 w-4" />
              トップに戻る
            </Link>
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={isRetrying}
            onClick={handleRetry}
          >
            {isRetrying ? (
              <>
                <Loader2
                  aria-hidden="true"
                  className="mr-2 h-4 w-4 animate-spin"
                />
                再取得中...
              </>
            ) : (
              <>
                <RefreshCw aria-hidden="true" className="mr-2 h-4 w-4" />
                再試行する
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
