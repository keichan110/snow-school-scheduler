"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { AuthGuard } from "./auth-guard";

/**
 * 保護されたルートのProps
 */
type ProtectedRouteProps = {
  children: ReactNode;
  /** 必要な権限レベル */
  requiredRole?: "ADMIN" | "MANAGER" | "MEMBER";
  /** 認証失敗時のリダイレクト先 */
  redirectTo?: string;
  /** 権限不足時のリダイレクト先 */
  accessDeniedRedirectTo?: string;
  /** リダイレクト前の確認メッセージを表示するか（未使用） */
  _showMessage?: boolean;
};

/**
 * 保護されたルートコンポーネント
 * ページレベルでの認証・権限保護を提供
 * AuthGuardとは異なり、主にページ全体の保護とリダイレクトに特化
 *
 * @example
 * ```tsx
 * // app/admin/page.tsx
 * export default function AdminPage() {
 *   return (
 *     <ProtectedRoute requiredRole="ADMIN">
 *       <AdminDashboard />
 *     </ProtectedRoute>
 *   );
 * }
 *
 * // app/dashboard/page.tsx
 * export default function DashboardPage() {
 *   return (
 *     <ProtectedRoute>
 *       <UserDashboard />
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */
export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/login", // シンプルなログインページパスに戻す
  accessDeniedRedirectTo = "/",
  _showMessage = false,
}: ProtectedRouteProps) {
  const { user, status } = useAuth();
  const router = useRouter();

  /**
   * 権限チェックロジック
   */
  const hasPermission = useCallback(
    (userRole: string, required: string): boolean => {
      const roleHierarchy = {
        ADMIN: 3,
        MANAGER: 2,
        MEMBER: 1,
      };

      const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy];
      const requiredLevel =
        roleHierarchy[required as keyof typeof roleHierarchy];

      return userLevel >= requiredLevel;
    },
    []
  );

  /**
   * 認証・権限状態に基づくリダイレクト処理
   */
  useEffect(() => {
    if (status === "loading") {
      return; // ローディング中は何もしない
    }

    // 未認証の場合
    if (status === "unauthenticated" || !user) {
      const currentUrl = window.location.pathname + window.location.search;
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentUrl)}`;

      router.push(redirectUrl);
      return;
    }

    // 認証済みだが権限不足の場合
    if (requiredRole && user && !hasPermission(user.role, requiredRole)) {
      router.push(accessDeniedRedirectTo);
      return;
    }

    // 認証エラーの場合
    if (status === "error") {
      router.push("/error?error=auth_failed");
      return;
    }
  }, [
    status,
    user,
    requiredRole,
    redirectTo,
    accessDeniedRedirectTo,
    router,
    hasPermission,
  ]);

  /**
   * AuthGuardでUIレンダリングを制御
   */
  return (
    <AuthGuard
      {...(requiredRole !== undefined && { requiredRole })}
      fallbackUrl={redirectTo}
    >
      {children}
    </AuthGuard>
  );
}

/**
 * Server Component用の認証チェック結果型
 */
export type AuthCheckResult = {
  isAuthenticated: boolean;
  hasPermission: boolean;
  user: unknown | null;
  redirectUrl: string | null;
};

/**
 * Server Component用の認証チェックヘルパー
 * Server Componentで使用するための認証チェック関数
 *
 * @example
 * ```tsx
 * // app/admin/page.tsx (Server Component)
 * import { getServerAuthCheck } from '@/components/auth/ProtectedRoute';
 * import { redirect } from 'next/navigation';
 *
 * export default async function AdminPage() {
 *   const authCheck = await getServerAuthCheck('ADMIN');
 *
 *   if (authCheck.redirectUrl) {
 *     redirect(authCheck.redirectUrl);
 *   }
 *
 *   return <AdminDashboard user={authCheck.user} />;
 * }
 * ```
 */
export async function getServerAuthCheck(
  requiredRole?: "ADMIN" | "MANAGER" | "MEMBER"
): Promise<AuthCheckResult> {
  try {
    // Next.js の cookies() を使用してJWTトークンを取得
    const { cookies } = await import("next/headers");
    const token = (await cookies()).get("auth-token")?.value;

    if (!token) {
      return {
        isAuthenticated: false,
        hasPermission: false,
        user: null,
        redirectUrl: "/login", // シンプルなログインページにリダイレクト
      };
    }

    // JWTトークンの検証
    const { verifyJwt } = await import("@/lib/auth/jwt");
    const verificationResult = verifyJwt(token);

    if (!(verificationResult.success && verificationResult.payload)) {
      return {
        isAuthenticated: false,
        hasPermission: false,
        user: null,
        redirectUrl: "/login", // シンプルなログインページにリダイレクト
      };
    }

    const user = verificationResult.payload;

    // 権限チェック
    let hasPermission = true;
    if (requiredRole) {
      const roleHierarchy = {
        ADMIN: 3,
        MANAGER: 2,
        MEMBER: 1,
      };

      const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy];
      const requiredLevel =
        roleHierarchy[requiredRole as keyof typeof roleHierarchy];
      hasPermission = userLevel >= requiredLevel;
    }

    return {
      isAuthenticated: true,
      hasPermission,
      user,
      redirectUrl: hasPermission ? null : "/",
    };
  } catch (_error) {
    return {
      isAuthenticated: false,
      hasPermission: false,
      user: null,
      redirectUrl: "/api/auth/line/login", // LINEログインに直接リダイレクト
    };
  }
}

/**
 * レイアウトレベルでの認証保護コンポーネント
 */
type ProtectedLayoutProps = {
  children: ReactNode;
  /** レイアウト名（ログ出力用） */
  layoutName?: string;
  /** 必要な権限レベル */
  requiredRole?: "ADMIN" | "MANAGER" | "MEMBER";
  /** 未認証時の代替レンダリング */
  fallback?: ReactNode;
};

/**
 * レイアウトレベルでの認証保護
 * layout.tsx で使用して、配下のすべてのページを保護
 *
 * @example
 * ```tsx
 * // app/admin/layout.tsx
 * export default function AdminLayout({ children }: { children: ReactNode }) {
 *   return (
 *     <ProtectedLayout
 *       layoutName="Admin"
 *       requiredRole="ADMIN"
 *       fallback={<UnauthorizedMessage />}
 *     >
 *       <AdminNavigation />
 *       {children}
 *     </ProtectedLayout>
 *   );
 * }
 * ```
 */
export function ProtectedLayout({
  children,
  layoutName = "Protected",
  requiredRole,
  fallback,
}: ProtectedLayoutProps) {
  // レイアウトレベルではリダイレクトではなくUIで制御
  return (
    <AuthGuard
      {...(requiredRole !== undefined && { requiredRole })}
      accessDeniedComponent={fallback}
      loadingComponent={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse text-muted-foreground">
              {layoutName} Layout Loading...
            </div>
          </div>
        </div>
      }
    >
      {children}
    </AuthGuard>
  );
}

/**
 * 条件付き保護コンポーネント
 * 動的に保護の有無を切り替えられる
 */
type ConditionalProtectionProps = {
  children: ReactNode;
  /** 保護を有効にするか */
  enabled: boolean;
  /** 必要な権限レベル */
  requiredRole?: "ADMIN" | "MANAGER" | "MEMBER";
};

/**
 * 条件付き認証保護
 * 開発環境や特定の条件下でのみ保護を有効化
 *
 * @example
 * ```tsx
 * <ConditionalProtection
 *   enabled={process.env.NODE_ENV === 'production'}
 *   requiredRole="ADMIN"
 * >
 *   <DevPanel />
 * </ConditionalProtection>
 * ```
 */
export function ConditionalProtection({
  children,
  enabled,
  requiredRole,
}: ConditionalProtectionProps) {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <AuthGuard {...(requiredRole !== undefined && { requiredRole })}>
      {children}
    </AuthGuard>
  );
}
