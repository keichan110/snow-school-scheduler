import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

interface PublicShiftsErrorStateProps {
  error: unknown;
  onRetry: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'データの読み込みに失敗しました';
}

export function PublicShiftsErrorState({ error, onRetry }: PublicShiftsErrorStateProps) {
  const message = getErrorMessage(error);

  return (
    <div className="min-h-screen">
      <Header />

      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-md text-center">
          <div className="mb-2 text-lg font-medium text-red-600 dark:text-red-400">
            エラーが発生しました
          </div>
          <div className="text-sm text-muted-foreground">{message}</div>
          <Button onClick={onRetry} className="mt-6" type="button">
            再試行
          </Button>
        </div>
      </div>
    </div>
  );
}
