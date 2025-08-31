import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromToken } from '@/lib/auth/jwt';
import { checkApiPermission } from '@/lib/auth/permissions';
import type { Resource } from '@/lib/auth/permissions';

/**
 * Next.js Middleware - APIルート保護
 *
 * 権限ベースのアクセス制御を全APIエンドポイントに適用
 * - JWT認証チェック
 * - ロールベース権限チェック
 * - リソース・アクション別アクセス制御
 */

// APIパスとリソースのマッピング
const API_RESOURCE_MAPPING: Record<string, Resource> = {
  '/api/auth/users': 'users',
  '/api/auth/invitations': 'invitations',
  '/api/departments': 'departments',
  '/api/instructors': 'instructors',
  '/api/certifications': 'certifications',
  '/api/shifts': 'shifts',
  '/api/shift-types': 'shift-types',
  '/api/shift-assignments': 'shift-assignments',
} as const;

// 認証不要なAPIパス（完全一致）
const PUBLIC_API_PATHS = new Set([
  '/api/health',
  '/api/auth/line/login',
  '/api/auth/line/callback',
  '/api/auth/logout',
]);

// 認証不要なAPIパス（プレフィックス一致）
const PUBLIC_API_PREFIXES = [
  '/api/auth/invitations/', // 招待URL検証は認証不要
];

// 認証のみ必要なAPIパス（権限チェックなし）
const AUTH_ONLY_API_PATHS = new Set(['/api/auth/me']);

/**
 * APIパスからリソース名を抽出
 */
function getResourceFromPath(pathname: string): Resource | null {
  // 完全一致チェック
  for (const [path, resource] of Object.entries(API_RESOURCE_MAPPING)) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      return resource;
    }
  }

  // 動的ルート対応
  if (pathname.match(/^\/api\/auth\/invitations\/[^/]+$/)) {
    return 'invitations'; // DELETE /api/auth/invitations/[token]
  }

  if (pathname.match(/^\/api\/auth\/invitations\/[^/]+\/verify$/)) {
    return null; // 認証不要
  }

  if (pathname.match(/^\/api\/auth\/users\/[^/]+$/)) {
    return 'users'; // GET/PUT/DELETE /api/auth/users/[id]
  }

  // デフォルト: パスからリソース名を推測
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length >= 2 && segments[0] === 'api') {
    const resourceCandidate = segments[segments.length - 1];

    // 既知のリソース名と一致するかチェック
    const validResources = Object.values(API_RESOURCE_MAPPING);
    if (validResources.includes(resourceCandidate as Resource)) {
      return resourceCandidate as Resource;
    }
  }

  return null;
}

/**
 * APIパスが認証不要かチェック
 */
function isPublicPath(pathname: string): boolean {
  // 完全一致チェック
  if (PUBLIC_API_PATHS.has(pathname)) {
    return true;
  }

  // プレフィックス一致チェック
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * APIパスが認証のみ必要かチェック
 */
function isAuthOnlyPath(pathname: string): boolean {
  return AUTH_ONLY_API_PATHS.has(pathname);
}

/**
 * JWTトークンを取得
 */
function getJwtToken(request: NextRequest): string | null {
  // Authorization ヘッダーから取得
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Cookieから取得
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * 権限エラーレスポンス生成
 */
function createPermissionErrorResponse(message: string, status: number = 403) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'PERMISSION_DENIED',
    },
    { status }
  );
}

/**
 * 認証エラーレスポンス生成
 */
function createAuthErrorResponse(message: string = 'Authentication required') {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'AUTHENTICATION_REQUIRED',
    },
    { status: 401 }
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // APIルートのみを対象とする
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  console.log('🛡️ Middleware: Checking API access:', {
    path: pathname,
    method: request.method,
  });

  // 認証不要なAPIパスはそのまま通す
  if (isPublicPath(pathname)) {
    console.log('✅ Middleware: Public API access allowed');
    return NextResponse.next();
  }

  // JWTトークン取得
  const token = getJwtToken(request);
  if (!token) {
    console.log('❌ Middleware: No JWT token found');
    return createAuthErrorResponse();
  }

  // JWT検証とユーザー情報取得
  const user = extractUserFromToken(token);
  if (!user) {
    console.log('❌ Middleware: Invalid or expired JWT token');
    return createAuthErrorResponse('Invalid or expired authentication token');
  }

  // 非アクティブユーザーのチェック
  if (!user.isActive) {
    console.log('❌ Middleware: Inactive user access denied');
    return createPermissionErrorResponse('User account is inactive');
  }

  // 認証のみ必要なAPIは権限チェックをスキップ
  if (isAuthOnlyPath(pathname)) {
    console.log('✅ Middleware: Auth-only API access allowed');
    return NextResponse.next();
  }

  // リソース名を取得
  const resource = getResourceFromPath(pathname);
  if (!resource) {
    console.log('⚠️ Middleware: Unknown API resource, allowing access');
    return NextResponse.next();
  }

  // 権限チェック
  const hasPermission = checkApiPermission(user, resource, request.method);
  if (!hasPermission) {
    console.log('❌ Middleware: Permission denied:', {
      user: user.displayName,
      role: user.role,
      resource,
      method: request.method,
    });

    return createPermissionErrorResponse(
      `Access denied. Insufficient permissions for ${resource} ${request.method.toLowerCase()} operation.`
    );
  }

  console.log('✅ Middleware: Permission granted:', {
    user: user.displayName,
    role: user.role,
    resource,
    method: request.method,
  });

  return NextResponse.next();
}

// ミドルウェアの適用対象を設定
export const config = {
  matcher: [
    /*
     * 以下のパスで始まるものを除く全てのパスにマッチ:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化)
     * - favicon.ico (ファビコン)
     * - 公開ファイル (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
