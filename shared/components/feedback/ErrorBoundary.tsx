/**
 * 統一エラーバウンダリコンポーネント
 * アプリケーション全体のエラーハンドリングを統一
 */

'use client';

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * エラー情報の型定義
 */
interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

/**
 * エラーログ送信用の型
 */
interface ErrorReport {
  message: string;
  stack?: string | undefined;
  componentStack: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

/**
 * エラーログ送信関数
 */
const logError = (error: Error, errorInfo: React.ErrorInfo): void => {
  const errorReport: ErrorReport = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack || '',
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // エラー監視サービス（例: Sentry、LogRocket）に送信
  console.error('Application Error:', errorReport);

  // 本番環境では実際の監視サービスに送信
  if (process.env.NODE_ENV === 'production') {
    // TODO: 実際のエラー監視サービスに送信
    // Sentry.captureException(error, { extra: errorReport });
  }
};

/**
 * エラー表示コンポーネントのProps
 */
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * 一般的なエラー表示コンポーネント
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
  <div className="flex min-h-screen items-center justify-center bg-background p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <CardTitle className="text-xl">エラーが発生しました</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">
          申し訳ございません。予期しないエラーが発生しました。
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="rounded border bg-muted p-2 text-sm">
            <summary className="cursor-pointer font-medium">エラー詳細</summary>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button onClick={resetErrorBoundary} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          再試行
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = '/')} className="w-full">
          <Home className="mr-2 h-4 w-4" />
          ホームに戻る
        </Button>
      </CardFooter>
    </Card>
  </div>
);

/**
 * フォーム専用エラー表示コンポーネント
 */
const FormErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
  <Card className="border-destructive">
    <CardHeader>
      <CardTitle className="flex items-center text-destructive">
        <AlertTriangle className="mr-2 h-5 w-5" />
        フォームエラー
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        フォームの処理中にエラーが発生しました。もう一度お試しください。
      </p>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-2 rounded border bg-muted p-2 text-xs">
          <summary className="cursor-pointer">エラー詳細</summary>
          <pre className="mt-1 overflow-auto whitespace-pre-wrap">{error.message}</pre>
        </details>
      )}
    </CardContent>
    <CardFooter>
      <Button onClick={resetErrorBoundary} size="sm" className="w-full">
        <RefreshCw className="mr-2 h-4 w-4" />
        リセット
      </Button>
    </CardFooter>
  </Card>
);

/**
 * エラーバウンダリのProps
 */
interface AppErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: ((error: Error, errorInfo: React.ErrorInfo) => void) | undefined;
  isolate?: boolean; // 局所的なエラーハンドリング用
}

/**
 * アプリケーション用エラーバウンダリ
 */
export const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({
  children,
  fallback: FallbackComponent = ErrorFallback,
  onError,
  isolate = false,
}) => (
  <ReactErrorBoundary
    FallbackComponent={FallbackComponent}
    onError={(error, errorInfo) => {
      if (!isolate) {
        logError(error, errorInfo);
      }
      onError?.(error, errorInfo);
    }}
    onReset={() => {
      // エラーリセット時の処理
      // 必要に応じて状態をクリアする
    }}
  >
    {children}
  </ReactErrorBoundary>
);

/**
 * フォーム用エラーバウンダリ
 */
export const FormErrorBoundary: React.FC<{
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}> = ({ children, onError }) => (
  <AppErrorBoundary fallback={FormErrorFallback} onError={onError || undefined} isolate={true}>
    {children}
  </AppErrorBoundary>
);

/**
 * エラーバウンダリ用フック
 */
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    // エラーを上位のエラーバウンダリに伝播
    throw error;
  };
};

/**
 * 非同期エラー用フック
 */
export const useAsyncError = () => {
  const [, setError] = React.useState<Error | null>(null);

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
};
