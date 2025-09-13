import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware - APIルート保護とページ認証リダイレクト
 *
 * Edge Runtime制限により、JWTの完全検証は各APIルートで実行
 * middlewareでは基本的なトークン存在チェックと認証リダイレクトのみ実行
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

// 認証不要なページパス（完全一致）
const PUBLIC_PAGE_PATHS = new Set(['/login', '/terms', '/privacy']);

// 認証不要なページパス（プレフィックス一致）
const PUBLIC_PAGE_PREFIXES = [
  '/_next/', // Next.js内部ファイル
  '/favicon.ico',
];

/**
 * APIパスが認証不要かチェック
 */
function isPublicApiPath(pathname: string): boolean {
  // 完全一致チェック
  if (PUBLIC_API_PATHS.has(pathname)) {
    return true;
  }

  // プレフィックス一致チェック
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * ページパスが認証不要かチェック
 */
function isPublicPagePath(pathname: string): boolean {
  // 完全一致チェック
  if (PUBLIC_PAGE_PATHS.has(pathname)) {
    return true;
  }

  // プレフィックス一致チェック
  return PUBLIC_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
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

  // デバッグモードでのみログ出力
  if (process.env.NODE_ENV === 'development') {
    console.log('🛡️ Middleware: Checking access:', pathname);
  }

  // APIルートの処理
  if (pathname.startsWith('/api/')) {
    // 認証不要なAPIパスはそのまま通す
    if (isPublicApiPath(pathname)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Middleware: Public API access allowed');
      }
      return NextResponse.next();
    }

    // JWTトークン存在チェック
    const token = getJwtToken(request);
    if (!token) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Middleware: No JWT token found for API');
      }
      return createAuthErrorResponse();
    }

    // トークンが存在する場合、APIルートに処理を委譲
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Middleware: Token found, delegating to API route');
    }
    return NextResponse.next();
  }

  // ページルートの処理
  // 認証不要なページパスはそのまま通す
  if (isPublicPagePath(pathname)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Middleware: Public page access allowed');
    }
    return NextResponse.next();
  }

  // ページアクセスの認証チェック
  const token = getJwtToken(request);
  if (!token) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ Middleware: No JWT token found, redirecting to login');
    }
    // 認証が必要なページにアクセスした場合、/loginにリダイレクト
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // トークンが存在する場合、ページに処理を委譲
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Middleware: Token found, allowing page access');
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
