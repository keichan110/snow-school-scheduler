/**
 * 認証関連コンポーネントのエクスポート
 */

// 認証Context関連
export {
  AuthProvider,
  type AuthStatus,
  type User,
  useAuth,
  useRequireAuth,
  useRequireRole,
} from "../../contexts/AuthContext";
// 基本認証ガードコンポーネント
export {
  AdminGuard,
  AuthGuard,
  ConditionalAuth,
  ManagerGuard,
  MemberGuard,
  withAuth,
} from "./AuthGuard";
// ページレベル保護コンポーネント
export {
  type AuthCheckResult,
  ConditionalProtection,
  getServerAuthCheck,
  ProtectedLayout,
  ProtectedRoute,
} from "./ProtectedRoute";
