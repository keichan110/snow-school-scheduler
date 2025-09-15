/**
 * 認証関連コンポーネントのエクスポート
 */

// 基本認証ガードコンポーネント
export {
  AuthGuard,
  AdminGuard,
  ManagerGuard,
  MemberGuard,
  withAuth,
  ConditionalAuth,
} from './AuthGuard';

// ページレベル保護コンポーネント
export {
  ProtectedRoute,
  ProtectedLayout,
  ConditionalProtection,
  getServerAuthCheck,
  type AuthCheckResult,
} from './ProtectedRoute';

// 認証Context関連
export {
  useAuth,
  useRequireAuth,
  useRequireRole,
  AuthProvider,
  type User,
  type AuthStatus,
} from '../../contexts/AuthContext';
