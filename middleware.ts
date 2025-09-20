import { NextRequest, NextResponse } from 'next/server';
import { secureLog } from '@/lib/utils/logging';
import { checkRateLimit } from '@/lib/api/rate-limiting';

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

/**
 * Rate Limitエラーレスポンス生成
 */
function createRateLimitErrorResponse(resetTime: number, limit: number) {
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', limit.toString());
  headers.set('X-RateLimit-Remaining', '0');
  headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());

  return NextResponse.json(
    {
      success: false,
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    { status: 429, headers }
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // デバッグモードでのみログ出力
  secureLog('info', 'Middleware: Checking access', { pathname });

  // APIルートの処理
  if (pathname.startsWith('/api/')) {
    // Rate Limitチェック
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0]?.trim() || '127.0.0.1' : '127.0.0.1';
    const rateLimitResult = checkRateLimit(ip, pathname);

    if (!rateLimitResult.allowed) {
      secureLog('warn', 'Rate limit exceeded', {
        ip,
        pathname,
        remaining: rateLimitResult.remaining,
      });
      return createRateLimitErrorResponse(rateLimitResult.resetTime, rateLimitResult.limit);
    }

    // Rate Limitヘッダーを追加する関数
    const addRateLimitHeaders = (response: NextResponse) => {
      response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      response.headers.set(
        'X-RateLimit-Reset',
        Math.ceil(rateLimitResult.resetTime / 1000).toString()
      );
      return response;
    };

    // 認証不要なAPIパスはそのまま通す
    if (isPublicApiPath(pathname)) {
      secureLog('info', 'Middleware: Public API access allowed');
      return addRateLimitHeaders(NextResponse.next());
    }

    // JWTトークン存在チェック
    const token = getJwtToken(request);
    if (!token) {
      secureLog('warn', 'Middleware: No JWT token found for API');
      return createAuthErrorResponse();
    }

    // トークンが存在する場合、APIルートに処理を委譲
    secureLog('info', 'Middleware: Token found, delegating to API route', { hasToken: !!token });
    return addRateLimitHeaders(NextResponse.next());
  }

  // ページルートの処理
  // 認証不要なページパスはそのまま通す
  if (isPublicPagePath(pathname)) {
    secureLog('info', 'Middleware: Public page access allowed');
    return NextResponse.next();
  }

  // ページアクセスの認証チェック
  const token = getJwtToken(request);
  if (!token) {
    secureLog('warn', 'Middleware: No JWT token found, redirecting to login');
    // 認証が必要なページにアクセスした場合、/loginにリダイレクト
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // トークンが存在する場合、ページに処理を委譲
  secureLog('info', 'Middleware: Token found, allowing page access', { hasToken: !!token });
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
