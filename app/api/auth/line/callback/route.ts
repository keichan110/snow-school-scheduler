import { NextRequest, NextResponse } from 'next/server';
import { executeLineAuthFlow } from '@/lib/auth/line';
import { generateJwt } from '@/lib/auth/jwt';
import { validateInvitationToken, incrementTokenUsage } from '@/lib/auth/invitations';
import { prisma } from '@/lib/db';

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
      console.log('🚫 LINE authentication cancelled or failed:', {
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
      console.error('❌ Missing required callback parameters:', {
        code: !!code,
        state: !!receivedState,
      });
      return NextResponse.redirect(new URL('/error?reason=invalid_callback', request.url), {
        status: 302,
      });
    }

    // セッション情報の取得と検証
    const sessionCookie = request.cookies.get('auth-session')?.value;
    if (!sessionCookie) {
      console.error('❌ Authentication session not found');
      return NextResponse.redirect(new URL('/error?reason=session_expired', request.url), {
        status: 302,
      });
    }

    let sessionData: AuthSession;
    try {
      sessionData = JSON.parse(sessionCookie);
    } catch (parseError) {
      console.error('❌ Invalid session data format:', parseError);
      return NextResponse.redirect(new URL('/error?reason=invalid_session', request.url), {
        status: 302,
      });
    }

    // セッション有効期限チェック（10分）
    const sessionAge = Date.now() - sessionData.createdAt;
    if (sessionAge > 10 * 60 * 1000) {
      console.error('❌ Authentication session expired:', {
        ageMinutes: Math.round(sessionAge / 60000),
      });
      return NextResponse.redirect(new URL('/error?reason=session_expired', request.url), {
        status: 302,
      });
    }

    console.log('🔐 Processing LINE authentication callback:', {
      hasCode: true,
      hasState: true,
      hasInviteToken: !!sessionData.inviteToken,
      sessionAge: Math.round(sessionAge / 1000) + 's',
    });

    // LINE認証フローの実行
    const authResult = await executeLineAuthFlow(code, receivedState, sessionData.state);

    if (!authResult.success || !authResult.profile) {
      console.error('❌ LINE authentication flow failed:', authResult.error);
      return NextResponse.redirect(new URL('/error?reason=auth_failed', request.url), {
        status: 302,
      });
    }

    console.log('✅ LINE authentication successful:', {
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
      console.log('👤 Creating new user with invitation validation:', {
        lineUserId: authResult.profile.userId,
        displayName: authResult.profile.displayName,
        hasInviteToken: !!sessionData.inviteToken,
      });

      // 招待トークンの検証
      if (!sessionData.inviteToken) {
        console.error('❌ New user registration requires invitation token');
        return NextResponse.redirect(
          new URL('/error?reason=invitation_required', request.url),
          {
            status: 302,
          }
        );
      }

      // 招待トークンの有効性チェック
      const tokenValidation = await validateInvitationToken(sessionData.inviteToken);
      if (!tokenValidation.isValid) {
        console.error('❌ Invalid invitation token:', {
          token: sessionData.inviteToken.substring(0, 16) + '...',
          error: tokenValidation.error,
          errorCode: tokenValidation.errorCode,
        });

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

        console.log('✅ New user created via invitation:', {
          id: user.id,
          role: user.role,
          inviteToken: sessionData.inviteToken.substring(0, 16) + '...',
        });

        // 招待トークンの使用回数を増加
        try {
          await incrementTokenUsage(sessionData.inviteToken);
          console.log('📊 Invitation token usage incremented successfully');
        } catch (incrementError) {
          // 使用回数増加に失敗してもユーザー作成は成功しているので警告レベル
          console.warn('⚠️ Failed to increment invitation token usage:', incrementError);
        }
      } catch (createError) {
        console.error('❌ Failed to create user:', createError);
        return NextResponse.redirect(
          new URL('/error?reason=user_creation_failed', request.url),
          {
            status: 302,
          }
        );
      }
    } else {
      // 既存ユーザーの場合
      console.log('👤 Existing user login:', {
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
        console.log('📝 Updated user profile (display name and/or image)');
      }
    }

    // 非アクティブユーザーのチェック
    if (!user.isActive) {
      console.warn('⚠️ Inactive user attempted login:', { userId: user.id });
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
    if (process.env.NODE_ENV === 'development') {
      console.log('🎫 JWT generated for user:', user.displayName);
    }

    // 認証成功レスポンスの作成
    const successUrl = new URL('/', request.url); // ホームページにリダイレクト
    const response = NextResponse.redirect(successUrl, { status: 302 });

    // JWTをCookieに設定
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 48 * 60 * 60, // 48時間
      path: '/',
    });

    // 認証セッションCookieの削除
    response.cookies.set('auth-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    console.log('🎉 Authentication completed successfully:', {
      userId: user.id,
      displayName: user.displayName,
      role: user.role,
      redirectUrl: successUrl.toString(),
    });

    return response;
  } catch (error) {
    console.error('❌ Authentication callback error:', error);

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
      console.log('🚫 LINE authentication cancelled (POST):', error);
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
    console.error('❌ POST callback processing error:', error);
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
