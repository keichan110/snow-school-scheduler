"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { HTTP_STATUS } from "@/shared/constants";

/**
 * 認証状態管理Context
 * アプリケーション全体で認証状態とユーザー情報を管理
 */

/**
 * ユーザー情報の型定義
 */
export type User = {
  /** ユーザーID */
  id: string;
  /** LINEユーザーID */
  lineUserId: string;
  /** 表示名 */
  displayName: string;
  /** LINEプロフィール画像URL */
  profileImageUrl?: string | null;
  /** ユーザー権限 */
  role: "ADMIN" | "MANAGER" | "MEMBER";
  /** アクティブフラグ */
  isActive: boolean;
  /** 作成日時 */
  createdAt: Date;
  /** 更新日時 */
  updatedAt: Date;
};

/**
 * 認証状態の型定義
 */
export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

/**
 * 認証Contextの値の型定義
 */
type AuthContextValue = {
  /** 現在のユーザー情報 */
  user: User | null;
  /** 認証状態 */
  status: AuthStatus;
  /** エラーメッセージ */
  error: string | null;
  /** ユーザー情報の再取得 */
  refetch: () => Promise<void>;
  /** ログアウト */
  logout: () => Promise<void>;
  /** 表示名の更新 */
  updateDisplayName: (newDisplayName: string) => Promise<boolean>;
  /** 認証チェック（手動実行用） */
  checkAuth: () => Promise<void>;
};

/**
 * AuthContext作成
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProviderのProps
 */
type AuthProviderProps = {
  children: ReactNode;
};

/**
 * API Response型定義
 */
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  user?: T;
  error?: string;
};

/**
 * ユーザー情報取得
 */
async function fetchUserInfo(): Promise<User | null> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include", // Cookieを含める
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (
      response.status === HTTP_STATUS.UNAUTHORIZED ||
      response.status === HTTP_STATUS.FORBIDDEN
    ) {
      // 未認証または無効なユーザー
      return null;
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data: ApiResponse<User> = await response.json();

  if (!(data.success && data.user)) {
    return null;
  }

  // Date型に変換
  return {
    ...data.user,
    createdAt: new Date(data.user.createdAt),
    updatedAt: new Date(data.user.updatedAt),
  };
}

/**
 * ログアウト処理
 */
async function performLogout(): Promise<void> {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // ログアウトは失敗してもクライアント側では成功として扱う
    }

    await response.json();
  } catch {
    // ネットワークエラー等でもクライアント側では成功として扱う
  }
}

/**
 * 表示名更新
 */
async function updateUserDisplayName(newDisplayName: string): Promise<User> {
  const response = await fetch("/api/auth/me", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ displayName: newDisplayName }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  const data: ApiResponse<User> = await response.json();

  if (!(data.success && data.user)) {
    throw new Error("Failed to update display name");
  }

  // Date型に変換
  return {
    ...data.user,
    createdAt: new Date(data.user.createdAt),
    updatedAt: new Date(data.user.updatedAt),
  };
}

/**
 * AuthProvider コンポーネント
 * アプリケーション全体に認証状態を提供
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  /**
   * ユーザー情報取得・更新
   */
  const fetchAndSetUser = useCallback(async () => {
    try {
      setStatus("loading");
      setError(null);

      const userData = await fetchUserInfo();

      if (userData) {
        setUser(userData);
        setStatus("authenticated");
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Authentication check failed";
      setError(errorMessage);
      setStatus("error");
      setUser(null);
    }
  }, []);

  /**
   * ログアウト処理
   */
  const logout = async () => {
    try {
      // API呼び出しでサーバー側のログアウト処理
      await performLogout();
    } finally {
      // ローカル状態をクリア
      setUser(null);
      setStatus("unauthenticated");
      setError(null);

      // 注意：リダイレクト処理は呼び出し側（専用ログアウトページ）で実行
    }
  };

  /**
   * 表示名更新
   */
  const updateDisplayName = async (
    newDisplayName: string
  ): Promise<boolean> => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const updatedUser = await updateUserDisplayName(newDisplayName);
      setUser(updatedUser);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update display name";
      setError(errorMessage);
      return false;
    }
  };

  /**
   * 初回マウント時に認証状態をチェック
   */
  useEffect(() => {
    fetchAndSetUser();
  }, [fetchAndSetUser]);

  /**
   * Context値
   */
  const contextValue: AuthContextValue = {
    user,
    status,
    error,
    refetch: fetchAndSetUser,
    logout,
    updateDisplayName,
    checkAuth: fetchAndSetUser, // checkAuthとrefetchは同じ処理
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

/**
 * AuthContext を使用するカスタムフック
 * 認証状態とユーザー情報にアクセスするために使用
 *
 * @returns AuthContextValue
 * @throws Error AuthProvider外で使用された場合
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, status, logout } = useAuth();
 *
 *   if (status === 'loading') {
 *     return <div>Loading...</div>;
 *   }
 *
 *   if (status === 'unauthenticated') {
 *     return <div>Please log in</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user?.displayName}!</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

/**
 * 認証が必要なコンポーネントで使用するカスタムフック
 * 認証されていない場合は自動的にリダイレクトやエラー処理を行う
 *
 * @returns 認証済みユーザー情報（null以外が保証される）
 * @throws Error 認証されていない場合
 *
 * @example
 * ```tsx
 * function ProtectedComponent() {
 *   const user = useRequireAuth();
 *   // この時点でuserはnullではないことが保証される
 *
 *   return (
 *     <div>
 *       <h1>Admin Dashboard</h1>
 *       <p>Welcome, {user.displayName}!</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useRequireAuth(): User {
  const { user, status } = useAuth();

  if (status === "loading") {
    throw new Error("Authentication is still loading");
  }

  if (status === "unauthenticated" || !user) {
    throw new Error("Authentication required");
  }

  if (status === "error") {
    throw new Error("Authentication error occurred");
  }

  return user;
}

/**
 * 特定の権限が必要なコンポーネントで使用するカスタムフック
 *
 * @param requiredRole 必要な権限レベル
 * @returns 認証済みユーザー情報（権限確認済み）
 * @throws Error 権限が不足している場合
 *
 * @example
 * ```tsx
 * function AdminOnlyComponent() {
 *   const user = useRequireRole('ADMIN');
 *   // この時点でuserはADMIN権限を持つことが保証される
 *
 *   return <div>Admin only content</div>;
 * }
 * ```
 */
export function useRequireRole(
  requiredRole: "ADMIN" | "MANAGER" | "MEMBER"
): User {
  const user = useRequireAuth();

  const roleHierarchy = {
    ADMIN: 3,
    MANAGER: 2,
    MEMBER: 1,
  };

  const userRoleLevel = roleHierarchy[user.role];
  const requiredRoleLevel = roleHierarchy[requiredRole];

  if (userRoleLevel < requiredRoleLevel) {
    throw new Error(
      `Insufficient permissions. Required: ${requiredRole}, Current: ${user.role}`
    );
  }

  return user;
}
