'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';

interface InvitationsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function InvitationsError({ error, reset }: InvitationsErrorProps) {
  const { reset: resetQueryError } = useQueryErrorResetBoundary();

  useEffect(() => {
    console.error('Failed to render invitations page:', error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[320px] max-w-3xl flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">招待情報の読み込みに失敗しました</h2>
        <p className="text-sm text-muted-foreground">
          一時的な問題が発生しました。再試行しても解決しない場合は、システム管理者へお問い合わせください。
        </p>
      </div>
      <Button
        variant="outline"
        onClick={() => {
          resetQueryError();
          reset();
        }}
      >
        再試行
      </Button>
    </div>
  );
}
