import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookie, deleteCookie } from '@/lib/utils/cookies';
import { executeLineAuthFlow } from '@/lib/auth/line';
import { generateJwt } from '@/lib/auth/jwt';
import { validateInvitationToken, incrementTokenUsage } from '@/lib/auth/invitations';
import { prisma } from '@/lib/db';
import { secureAuthLog, secureLog } from '@/lib/utils/logging';

/**
 * LINE認証コールバックAPI
 * LINE認証完了後のコールバック処理
 *
 * GET /api/auth/line/callback?code=xxx&state=xxx
 *
 * Query Parameters:
 * - code: string - LINE認証コード
 * - state: string - CSRF防止用state値
 * - error?: string - 認証エラー（ユーザーがキャンセル時等）
 * - error_description?: string - エラー詳細
 *
 * Response:
 * - 302 Redirect: 認証成功時は管理画面へリダイレクト
 * - 400/401/500 Error: エラー詳細付きJSONレスポンスまたはエラーページリダイレクト
 */

interface AuthSession {
  state: string;
  createdAt: number;
  inviteToken?: string;
  redirectUrl?: string; // 認証完了後のリダイレクト先
}

function resolveErrorMessage(error: unknown, fallback: string = 'Unknown error'): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error.trim();
  }

  return fallback;
}

/**
 * GET /api/auth/line/callback
 * LINE認証コールバック処理
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // エラーパラメータのチェック
    const error = searchParams.get('error');
    if (error) {
      const errorDescription = searchParams.get('error_description');
      secureLog('info', 'LINE authentication cancelled or failed', {
        error,
        description: errorDescription,
      });

      // エラーページにリダイレクト（将来実装）
      return NextResponse.redirect(new URL('/error?reason=cancelled', request.url), {
        status: 302,
      });
    }

    // 必須パラメータの取得
    const code = searchParams.get('code');
    const receivedState = searchParams.get('state');

    if (!code || !receivedState) {
      secureLog('error', 'Missing required LINE callback parameters');
      return NextResponse.redirect(new URL('/error?reason=invalid_callback', request.url), {
        status: 302,
      });
    }

    // セッション情報の取得と検証
    const sessionCookie = request.cookies.get('auth-session')?.value;
    if (!sessionCookie) {
      secureLog('error', 'Authentication session cookie missing');
      return NextResponse.redirect(new URL('/error?reason=session_expired', request.url), {
        status: 302,
      });
    }

    let sessionData: AuthSession;
    try {
      sessionData = JSON.parse(sessionCookie);
    } catch {
      secureLog('error', 'Invalid authentication session data format');
      return NextResponse.redirect(new URL('/error?reason=invalid_session', request.url), {
        status: 302,
      });
    }

    // セッション有効期限チェック（10分）
    const sessionAge = Date.now() - sessionData.createdAt;
    if (sessionAge > 10 * 60 * 1000) {
      secureLog('error', 'Authentication session expired');
      return NextResponse.redirect(new URL('/error?reason=session_expired', request.url), {
        status: 302,
      });
    }

    secureAuthLog('Processing LINE authentication callback', {
      hasCode: true,
      hasState: true,
      hasInviteToken: !!sessionData.inviteToken,
      sessionAge: Math.round(sessionAge / 1000) + 's',
    });

    // LINE認証フローの実行
    const authResult = await executeLineAuthFlow(code, receivedState, sessionData.state);

    if (!authResult.success || !authResult.profile) {
      secureLog('error', 'LINE authentication flow failed');
      return NextResponse.redirect(new URL('/error?reason=auth_failed', request.url), {
        status: 302,
      });
    }

    secureAuthLog('LINE authentication successful', {
      userId: authResult.profile.userId,
      displayName: authResult.profile.displayName,
      hasInviteToken: !!authResult.inviteToken,
    });

    // ユーザーの存在確認・作成処理
    let user = await prisma.user.findUnique({
      where: {
        lineUserId: authResult.profile.userId,
      },
    });

    if (!user) {
      // 新規ユーザーの場合 - 招待トークン検証が必要
      secureAuthLog('Creating new user with invitation validation', {
        lineUserId: authResult.profile.userId,
        displayName: authResult.profile.displayName,
        hasInviteToken: !!sessionData.inviteToken,
      });

      // 招待トークンの検証
      if (!sessionData.inviteToken) {
        secureLog('error', 'New user registration requires invitation token');
        return NextResponse.redirect(new URL('/error?reason=invitation_required', request.url), {
          status: 302,
        });
      }

      // 招待トークンの有効性チェック
      const tokenValidation = await validateInvitationToken(sessionData.inviteToken);
      if (!tokenValidation.isValid) {
        secureLog('error', 'Invalid invitation token');

        const errorReason =
          tokenValidation.errorCode === 'EXPIRED'
            ? 'invitation_expired'
            : tokenValidation.errorCode === 'MAX_USES_EXCEEDED'
              ? 'invitation_exhausted'
              : tokenValidation.errorCode === 'INACTIVE'
                ? 'invitation_inactive'
                : 'invitation_invalid';

        return NextResponse.redirect(new URL(`/error?reason=${errorReason}`, request.url), {
          status: 302,
        });
      }

      try {
        // ユーザー作成
        user = await prisma.user.create({
          data: {
            lineUserId: authResult.profile.userId,
            displayName: authResult.profile.displayName,
            profileImageUrl: authResult.profile.pictureUrl || null,
            role: 'MEMBER', // 招待経由のユーザーはMEMBER権限
            isActive: true,
          },
        });

        secureAuthLog('New user created via invitation', {
          id: user.id,
          role: user.role,
          inviteToken: sessionData.inviteToken.substring(0, 16) + '...',
        });

        // 招待トークンの使用回数を増加
        try {
          await incrementTokenUsage(sessionData.inviteToken);
          secureLog('info', 'Invitation token usage incremented successfully');
        } catch (incrementError) {
          // 使用回数増加に失敗してもユーザー作成は成功しているので警告レベル
          secureLog('warn', 'Failed to increment invitation token usage', {
            error: resolveErrorMessage(
              incrementError,
              'Unknown error while incrementing invitation token usage'
            ),
          });
        }
      } catch (userCreationError) {
        secureLog('error', 'Failed to create user', {
          error: resolveErrorMessage(userCreationError, 'Unknown error during user creation'),
        });
        return NextResponse.redirect(new URL('/error?reason=user_creation_failed', request.url), {
          status: 302,
        });
      }
    } else {
      // 既存ユーザーの場合
      secureAuthLog('Existing user login', {
        id: user.id,
        displayName: user.displayName,
        role: user.role,
        isActive: user.isActive,
      });

      // 表示名とプロフィール画像の更新（LINEで変更された場合）
      const needsUpdate =
        user.displayName !== authResult.profile.displayName ||
        user.profileImageUrl !== (authResult.profile.pictureUrl || null);

      if (needsUpdate) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            displayName: authResult.profile.displayName,
            profileImageUrl: authResult.profile.pictureUrl || null,
          },
        });
        secureLog('info', 'Updated user profile (display name and/or image)');
      }
    }

    // 非アクティブユーザーのチェック
    if (!user.isActive) {
      secureLog('warn', 'Inactive user attempted login', { userId: user.id });
      return NextResponse.redirect(new URL('/error?reason=inactive_user', request.url), {
        status: 302,
      });
    }

    // JWT生成
    const jwtPayload = {
      userId: user.id,
      lineUserId: user.lineUserId,
      displayName: user.displayName,
      role: user.role as 'ADMIN' | 'MANAGER' | 'MEMBER',
      isActive: user.isActive,
    };

    const token = generateJwt(jwtPayload);
    secureLog('info', 'JWT generated for user', { displayName: user.displayName });

    // 認証成功レスポンスの作成（保存されたリダイレクト先を使用）
    const redirectPath = sessionData.redirectUrl || '/'; // デフォルトはホームページ
    const successUrl = new URL(redirectPath, request.url);
    const response = NextResponse.redirect(successUrl, { status: 302 });

    // JWTをCookieに設定（セキュアな設定を適用）
    setAuthCookie(response, token);

    // 認証セッションCookieの削除
    deleteCookie(response, 'auth-session');

    secureAuthLog('Authentication completed successfully', {
      userId: user.id,
      displayName: user.displayName,
      role: user.role,
      redirectUrl: successUrl.toString(),
    });

    return response;
  } catch (error) {
    secureLog('error', 'Authentication callback failed', {
      error: resolveErrorMessage(error, 'Unknown error during authentication callback'),
    });

    // システムエラー時のリダイレクト
    return NextResponse.redirect(new URL('/error?reason=system_error', request.url), {
      status: 302,
    });
  }
}

/**
 * POST /api/auth/line/callback
 * POST形式でのコールバック処理（必要に応じて）
 */
export async function POST(request: NextRequest) {
  // POSTでのコールバックは通常使用されないが、念のため実装
  try {
    const formData = await request.formData();
    const code = formData.get('code')?.toString();
    const state = formData.get('state')?.toString();
    const error = formData.get('error')?.toString();

    if (error) {
      secureLog('info', 'LINE authentication cancelled via POST callback', { error });
      return NextResponse.redirect(new URL('/error?reason=cancelled', request.url), {
        status: 302,
      });
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/error?reason=invalid_callback', request.url), {
        status: 302,
      });
    }

    // GET処理と同様の処理を実行
    const urlWithParams = new URL(request.url);
    urlWithParams.searchParams.set('code', code);
    urlWithParams.searchParams.set('state', state);

    const modifiedRequest = new NextRequest(urlWithParams);
    return await GET(modifiedRequest);
  } catch (error) {
    secureLog('error', 'POST callback processing failed', {
      error: resolveErrorMessage(error, 'Unknown error during POST callback'),
    });
    return NextResponse.redirect(new URL('/error?reason=system_error', request.url), {
      status: 302,
    });
  }
}

/**
 * OPTIONS /api/auth/line/callback
 * CORS対応
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
