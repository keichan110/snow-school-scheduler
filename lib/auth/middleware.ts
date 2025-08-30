import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt, extractUserFromToken, JwtPayload } from './jwt';
import { prisma } from '@/lib/db';

/**
 * 認証ミドルウェア
 * JWT検証とユーザー情報取得機能を提供
 */

/**
 * 認証ユーザー情報の型定義
 */
export interface AuthenticatedUser {
  /** ユーザーID */
  id: string;
  /** LINEユーザーID */
  lineUserId: string;
  /** 表示名 */
  displayName: string;
  /** ユーザー権限 */
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  /** アクティブフラグ */
  isActive: boolean;
  /** 作成日時 */
  createdAt: Date;
  /** 更新日時 */
  updatedAt: Date;
}

/**
 * 認証結果の型定義
 */
export interface AuthenticationResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
  statusCode?: number;
}

/**
 * 権限チェック結果の型定義
 */
export interface AuthorizationResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
  statusCode?: number;
}

/**
 * Cookieから認証トークンを取得
 *
 * @returns JWT トークンまたは null
 */
export async function getAuthTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    return token || null;
  } catch (error) {
    // Server Component外での呼び出し等でエラーが発生する場合
    return null;
  }
}

/**
 * NextRequestから認証トークンを取得
 * API Routes用のトークン取得
 *
 * @param request - NextRequest オブジェクト
 * @returns JWT トークンまたは null
 */
export function getAuthTokenFromRequest(request: NextRequest): string | null {
  // Cookieからトークンを取得
  const token = request.cookies.get('auth-token')?.value;

  if (token) {
    return token;
  }

  // Authorization ヘッダーからもチェック（オプション）
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * JWT トークンを検証してユーザー情報を取得
 *
 * @param token - JWT トークン
 * @returns 認証結果
 */
export async function authenticateToken(token: string | null): Promise<AuthenticationResult> {
  if (!token) {
    return {
      success: false,
      error: 'Authentication token not found',
      statusCode: 401,
    };
  }

  // JWT検証
  const jwtResult = verifyJwt(token);
  if (!jwtResult.success || !jwtResult.payload) {
    return {
      success: false,
      error: jwtResult.error || 'Invalid authentication token',
      statusCode: 401,
    };
  }

  try {
    // データベースからユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: {
        id: jwtResult.payload.userId,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
        statusCode: 401,
      };
    }

    // ユーザーがアクティブかチェック
    if (!user.isActive) {
      return {
        success: false,
        error: 'User account is inactive',
        statusCode: 403,
      };
    }

    // LINE ユーザーID の整合性チェック
    if (user.lineUserId !== jwtResult.payload.lineUserId) {
      return {
        success: false,
        error: 'Token user ID mismatch',
        statusCode: 401,
      };
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      lineUserId: user.lineUserId,
      displayName: user.displayName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      success: true,
      user: authenticatedUser,
    };
  } catch (error) {
    return {
      success: false,
      error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      statusCode: 500,
    };
  }
}

/**
 * Cookieベースの認証チェック
 * Server Components用
 *
 * @returns 認証結果
 */
export async function authenticateFromCookies(): Promise<AuthenticationResult> {
  const token = await getAuthTokenFromCookies();
  return await authenticateToken(token);
}

/**
 * リクエストベースの認証チェック
 * API Routes用
 *
 * @param request - NextRequest オブジェクト
 * @returns 認証結果
 */
export async function authenticateFromRequest(request: NextRequest): Promise<AuthenticationResult> {
  const token = getAuthTokenFromRequest(request);
  return await authenticateToken(token);
}

/**
 * 権限チェック
 * 指定された権限以上のアクセス権限があるかチェック
 *
 * @param user - 認証済みユーザー
 * @param requiredRole - 必要な権限レベル
 * @returns 権限チェック結果
 */
export function checkUserRole(
  user: AuthenticatedUser,
  requiredRole: 'ADMIN' | 'MANAGER' | 'MEMBER'
): AuthorizationResult {
  const roleHierarchy = {
    ADMIN: 3,
    MANAGER: 2,
    MEMBER: 1,
  };

  const userRoleLevel = roleHierarchy[user.role];
  const requiredRoleLevel = roleHierarchy[requiredRole];

  if (userRoleLevel >= requiredRoleLevel) {
    return {
      success: true,
      user,
    };
  }

  return {
    success: false,
    error: `Insufficient permissions. Required: ${requiredRole}, Current: ${user.role}`,
    statusCode: 403,
  };
}

/**
 * 認証＋権限チェック（統合版）
 * トークン検証とロール確認を一度に実行
 *
 * @param token - JWT トークン
 * @param requiredRole - 必要な権限レベル
 * @returns 認証・権限チェック結果
 */
export async function authenticateAndAuthorize(
  token: string | null,
  requiredRole: 'ADMIN' | 'MANAGER' | 'MEMBER' = 'MEMBER'
): Promise<AuthorizationResult> {
  const authResult = await authenticateToken(token);

  if (!authResult.success || !authResult.user) {
    const result: AuthorizationResult = {
      success: false,
    };
    if (authResult.error) {
      result.error = authResult.error;
    }
    if (authResult.statusCode) {
      result.statusCode = authResult.statusCode;
    }
    return result;
  }

  return checkUserRole(authResult.user, requiredRole);
}

/**
 * API Route用認証ミドルウェア
 * Next.js API Routesで使用するヘルパー関数
 *
 * @param request - NextRequest オブジェクト
 * @param requiredRole - 必要な権限レベル
 * @returns 認証結果とエラーレスポンス（必要時）
 */
export async function withAuth(
  request: NextRequest,
  requiredRole: 'ADMIN' | 'MANAGER' | 'MEMBER' = 'MEMBER'
): Promise<{
  result: AuthorizationResult;
  errorResponse?: NextResponse;
}> {
  const token = getAuthTokenFromRequest(request);
  const result = await authenticateAndAuthorize(token, requiredRole);

  if (!result.success) {
    const errorResponse = NextResponse.json(
      {
        success: false,
        error: result.error || 'Authentication failed',
      },
      { status: result.statusCode || 401 }
    );

    return { result, errorResponse };
  }

  return { result };
}

/**
 * 認証トークン設定
 * ログイン成功時にCookieにJWTを設定
 *
 * @param token - JWT トークン
 * @returns NextResponse（Cookieヘッダー設定済み）
 */
export function setAuthCookie(token: string): NextResponse {
  const response = NextResponse.json({ success: true });

  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 48 * 60 * 60, // 48時間（JWTの有効期限と同じ）
    path: '/',
  });

  return response;
}

/**
 * 認証トークン削除
 * ログアウト時にCookieからJWTを削除
 *
 * @returns NextResponse（Cookie削除ヘッダー設定済み）
 */
export function clearAuthCookie(): NextResponse {
  const response = NextResponse.json({ success: true });

  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // 即座に削除
    path: '/',
  });

  return response;
}

/**
 * 現在の認証状態をチェック（デバッグ用）
 * 開発環境でのトラブルシューティング用
 *
 * @param request - NextRequest オブジェクト
 * @returns デバッグ情報
 */
export async function getAuthDebugInfo(request: NextRequest) {
  const token = getAuthTokenFromRequest(request);
  const hasToken = !!token;

  let jwtInfo = null;
  let dbUser = null;

  if (token) {
    const jwtResult = verifyJwt(token);
    jwtInfo = {
      valid: jwtResult.success,
      payload: jwtResult.payload
        ? {
            userId: jwtResult.payload.userId,
            role: jwtResult.payload.role,
            exp: jwtResult.payload.exp,
          }
        : null,
      error: jwtResult.error,
    };

    if (jwtResult.success && jwtResult.payload) {
      try {
        dbUser = await prisma.user.findUnique({
          where: { id: jwtResult.payload.userId },
          select: {
            id: true,
            displayName: true,
            role: true,
            isActive: true,
          },
        });
      } catch (error) {
        dbUser = { error: 'Database query failed' };
      }
    }
  }

  return {
    hasToken,
    token: token ? `${token.substring(0, 20)}...` : null, // 最初の20文字のみ表示
    jwt: jwtInfo,
    user: dbUser,
  };
}
