'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Home, RefreshCw, Shield, XCircle } from 'lucide-react';
import { Suspense } from 'react';

/**
 * 認証エラーページのメインコンテンツ
 */
function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const error = searchParams?.get('error') || searchParams?.get('reason') || 'unknown';
  const description = searchParams?.get('description') || '';

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * エラー情報の取得
   */
  const getErrorInfo = () => {
    switch (error) {
      case 'access_denied':
      case 'cancelled':
        return {
          title: 'ログインがキャンセルされました',
          message:
            'LINEログインがキャンセルされました。ログインを継続するには、再度お試しください。',
          icon: <XCircle className="h-8 w-8 text-orange-500" />,
          canRetry: true,
          severity: 'warning' as const,
        };

      case 'invalid_request':
      case 'invalid_callback':
        return {
          title: '認証エラーが発生しました',
          message: '認証プロセスでエラーが発生しました。時間をおいて再度お試しください。',
          icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
          canRetry: true,
          severity: 'error' as const,
        };

      case 'session_expired':
        return {
          title: 'セッションが期限切れです',
          message: 'ログインセッションが期限切れになりました。再度ログインしてください。',
          icon: <AlertTriangle className="h-8 w-8 text-yellow-500" />,
          canRetry: true,
          severity: 'warning' as const,
        };

      case 'auth_failed':
        return {
          title: '認証に失敗しました',
          message: 'LINEアカウントでの認証に失敗しました。アカウントの設定をご確認ください。',
          icon: <Shield className="h-8 w-8 text-red-500" />,
          canRetry: true,
          severity: 'error' as const,
        };

      case 'inactive_user':
        return {
          title: 'アカウントが無効です',
          message: 'このアカウントは現在無効化されています。管理者にお問い合わせください。',
          icon: <XCircle className="h-8 w-8 text-red-500" />,
          canRetry: false,
          severity: 'error' as const,
        };

      case 'permission_denied':
        return {
          title: 'アクセス権限がありません',
          message: 'このシステムへのアクセス権限がありません。管理者にお問い合わせください。',
          icon: <Shield className="h-8 w-8 text-red-500" />,
          canRetry: false,
          severity: 'error' as const,
        };

      case 'system_error':
        return {
          title: 'システムエラーが発生しました',
          message: 'システムで問題が発生しています。しばらく時間をおいて再度お試しください。',
          icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
          canRetry: true,
          severity: 'error' as const,
        };

      default:
        return {
          title: '予期しないエラーが発生しました',
          message: '不明なエラーが発生しました。管理者にお問い合わせください。',
          icon: <AlertTriangle className="h-8 w-8 text-gray-500" />,
          canRetry: true,
          severity: 'error' as const,
        };
    }
  };

  const errorInfo = getErrorInfo();

  /**
   * ログインページに戻る
   */
  const handleRetryLogin = () => {
    router.push('/login');
  };

  /**
   * ホームページに戻る
   */
  const handleGoHome = () => {
    router.push('/');
  };

  /**
   * ページを再読み込み
   */
  const handleRefresh = () => {
    window.location.reload();
  };

  if (!mounted) {
    return null; // SSR時のハイドレーションエラーを防ぐ
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* エラー表示カード */}
        <Card className="border-0 bg-card/50 shadow-lg backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-background/80">
              {errorInfo.icon}
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold text-foreground">{errorInfo.title}</CardTitle>
              <CardDescription className="text-center">
                スキー・スノーボードスクール
                <br />
                シフト管理システム
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* エラーメッセージ */}
            <Alert variant={errorInfo.severity === 'error' ? 'destructive' : 'default'}>
              <AlertDescription className="text-sm">
                {errorInfo.message}
                {description && (
                  <>
                    <br />
                    <br />
                    <span className="text-xs text-muted-foreground">詳細: {description}</span>
                  </>
                )}
              </AlertDescription>
            </Alert>

            {/* アクションボタン */}
            <div className="space-y-3">
              {errorInfo.canRetry && (
                <>
                  <Button
                    onClick={handleRetryLogin}
                    className="w-full bg-[#06C755] text-white hover:bg-[#05B84C]"
                    size="lg"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    再度ログインする
                  </Button>
                  <Button onClick={handleRefresh} variant="outline" className="w-full" size="lg">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    ページを再読み込み
                  </Button>
                </>
              )}
              <Button onClick={handleGoHome} variant="ghost" className="w-full" size="lg">
                <Home className="mr-2 h-4 w-4" />
                ホームに戻る
              </Button>
            </div>

            {/* 追加情報 */}
            <div className="space-y-2 text-center text-xs text-muted-foreground">
              <p>
                問題が継続する場合は、
                <br />
                管理者にお問い合わせください。
              </p>
              {error !== 'unknown' && <p>エラーコード: {error}</p>}
            </div>
          </CardContent>
        </Card>

        {/* システム情報 */}
        <Card className="border-0 bg-card/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="space-y-2 text-center text-xs text-muted-foreground">
              <p>
                このシステムはLINEアカウントでの認証が必要です。
                <br />
                LINE アプリがインストールされていることをご確認ください。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * 認証エラーページ
 * LINE認証エラー、権限エラー、セッションエラーなどを表示
 */
export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}