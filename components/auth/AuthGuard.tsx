'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useAuth, User } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Home, LogIn } from 'lucide-react';

/**
 * 認証ガードコンポーネントのProps
 */
interface AuthGuardProps {
  children: ReactNode;
  /** 必要な権限レベル */
  requiredRole?: 'ADMIN' | 'MANAGER' | 'MEMBER';
  /** 認証失敗時のリダイレクト先 */
  fallbackUrl?: string;
  /** ローディング中の表示カスタマイズ */
  loadingComponent?: ReactNode;
  /** 認証エラー時の表示カスタマイズ */
  errorComponent?: ReactNode;
  /** アクセス拒否時の表示カスタマイズ */
  accessDeniedComponent?: ReactNode;
}

/**
 * 認証ガードコンポーネント
 * 子コンポーネントを認証・権限チェックで保護する
 *
 * @example
 * ```tsx
 * // 基本的な認証保護
 * <AuthGuard>
 *   <PrivateContent />
 * </AuthGuard>
 *
 * // 管理者権限が必要
 * <AuthGuard requiredRole="ADMIN">
 *   <AdminPanel />
 * </AuthGuard>
 *
 * // カスタムフォールバック
 * <AuthGuard
 *   requiredRole="MANAGER"
 *   fallbackUrl="/dashboard"
 *   loadingComponent={<CustomLoader />}
 * >
 *   <ManagerContent />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({
  children,
  requiredRole,
  fallbackUrl = '/login',
  loadingComponent,
  errorComponent,
  accessDeniedComponent,
}: AuthGuardProps) {
  const { user, status, error } = useAuth();
  const router = useRouter();

  /**
   * 権限レベルの階層チェック
   */
  const hasRequiredPermission = (user: User, required: string): boolean => {
    const roleHierarchy = {
      ADMIN: 3,
      MANAGER: 2,
      MEMBER: 1,
    };

    const userLevel = roleHierarchy[user.role];
    const requiredLevel = roleHierarchy[required as keyof typeof roleHierarchy];

    return userLevel >= requiredLevel;
  };

  /**
   * 認証状態に基づくリダイレクト処理
   */
  useEffect(() => {
    if (status === 'unauthenticated') {
      // 未認証の場合、現在のURLを保存してログインページにリダイレクト
      const currentPath = window.location.pathname + window.location.search;
      const encodedRedirect = encodeURIComponent(currentPath);
      router.push(`${fallbackUrl}?redirect=${encodedRedirect}`);
    }
  }, [status, router, fallbackUrl]);

  /**
   * ローディング状態
   */
  if (status === 'loading') {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">認証状態を確認しています...</p>
        </div>
      </div>
    );
  }

  /**
   * 認証エラー状態
   */
  if (status === 'error') {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    return (
      <div className="flex min-h-[400px] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">認証エラー</h3>
                <p className="text-muted-foreground">認証処理中にエラーが発生しました</p>
              </div>

              <Alert variant="destructive">
                <AlertDescription>{error || '不明なエラーが発生しました'}</AlertDescription>
              </Alert>

              <div className="flex w-full flex-col space-y-2">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  再試行
                </Button>
                <Button onClick={() => router.push('/')} variant="ghost" className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  ホームに戻る
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * 未認証状態（リダイレクト処理中）
   */
  if (status === 'unauthenticated' || !user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">ログインページにリダイレクトしています...</p>
        </div>
      </div>
    );
  }

  /**
   * 権限不足チェック
   */
  if (requiredRole && !hasRequiredPermission(user, requiredRole)) {
    if (accessDeniedComponent) {
      return <>{accessDeniedComponent}</>;
    }

    // 権限がない場合は404ページを表示
    notFound();
  }

  /**
   * 認証・権限チェック通過 - 子コンポーネントをレンダリング
   */
  return <>{children}</>;
}

/**
 * 管理者専用ガードコンポーネント
 */
export function AdminGuard({ children, ...props }: Omit<AuthGuardProps, 'requiredRole'>) {
  return (
    <AuthGuard requiredRole="ADMIN" {...props}>
      {children}
    </AuthGuard>
  );
}

/**
 * マネージャー以上専用ガードコンポーネント
 */
export function ManagerGuard({ children, ...props }: Omit<AuthGuardProps, 'requiredRole'>) {
  return (
    <AuthGuard requiredRole="MANAGER" {...props}>
      {children}
    </AuthGuard>
  );
}

/**
 * メンバー以上専用ガードコンポーネント（基本的な認証保護）
 */
export function MemberGuard({ children, ...props }: Omit<AuthGuardProps, 'requiredRole'>) {
  return (
    <AuthGuard requiredRole="MEMBER" {...props}>
      {children}
    </AuthGuard>
  );
}

/**
 * ページレベル認証保護用のHOC
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'ADMIN' | 'MANAGER' | 'MEMBER'
) {
  const AuthenticatedComponent = (props: P) => {
    return (
      <AuthGuard {...(requiredRole !== undefined && { requiredRole })}>
        <Component {...props} />
      </AuthGuard>
    );
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return AuthenticatedComponent;
}

/**
 * 認証状態を条件にコンテンツを表示するコンポーネント
 */
interface ConditionalAuthProps {
  children: ReactNode;
  /** 認証済み時に表示 */
  authenticated?: ReactNode;
  /** 未認証時に表示 */
  unauthenticated?: ReactNode;
  /** ローディング中に表示 */
  loading?: ReactNode;
  /** エラー時に表示 */
  error?: ReactNode;
  /** 権限レベルチェック */
  requiredRole?: 'ADMIN' | 'MANAGER' | 'MEMBER';
  /** 権限不足時に表示 */
  accessDenied?: ReactNode;
}

/**
 * 認証状態に基づく条件付きレンダリング
 *
 * @example
 * ```tsx
 * <ConditionalAuth
 *   authenticated={<PrivateContent />}
 *   unauthenticated={<PublicContent />}
 *   loading={<LoadingSpinner />}
 * />
 * ```
 */
export function ConditionalAuth({
  children,
  authenticated,
  unauthenticated,
  loading,
  error: errorComponent,
  requiredRole,
  accessDenied,
}: ConditionalAuthProps) {
  const { user, status } = useAuth();

  if (status === 'loading') {
    return <>{loading || children}</>;
  }

  if (status === 'error') {
    return <>{errorComponent || children}</>;
  }

  if (status === 'unauthenticated' || !user) {
    return <>{unauthenticated || children}</>;
  }

  if (requiredRole !== undefined) {
    const roleHierarchy = {
      ADMIN: 3,
      MANAGER: 2,
      MEMBER: 1,
    };

    const userLevel = roleHierarchy[user.role];
    const requiredLevel = roleHierarchy[requiredRole];

    if (userLevel < requiredLevel) {
      return <>{accessDenied || children}</>;
    }
  }

  return <>{authenticated || children}</>;
}
