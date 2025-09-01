import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware - 基本的なAPIルート保護
 *
 * Edge Runtime制限により、JWTの完全検証は各APIルートで実行
 * middlewareでは基本的なトークン存在チェックのみ実行
 */

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

  // デバッグモードでのみログ出力
  if (process.env.NODE_ENV === 'development') {
    console.log('🛡️ Middleware: Checking API access:', pathname);
  }

  // 認証不要なAPIパスはそのまま通す
  if (isPublicPath(pathname)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Middleware: Public API access allowed');
    }
    return NextResponse.next();
  }

  // JWTトークン存在チェック
  const token = getJwtToken(request);
  if (!token) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ Middleware: No JWT token found');
    }
    return createAuthErrorResponse();
  }

  // トークンが存在する場合、APIルートに処理を委譲
  // 詳細な認証・権限チェックは各APIルートで実行
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Middleware: Token found, delegating to API route');
  }
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
