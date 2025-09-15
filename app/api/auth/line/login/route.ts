import { NextRequest, NextResponse } from 'next/server';
import { generateState, generateLineAuthUrl, validateLineAuthConfig } from '@/lib/auth/line';
import { secureLog, secureAuthLog } from '@/lib/utils/logging';
import { setSessionCookie } from '@/lib/utils/cookies';

/**
 * LINE認証開始API
 * ユーザーをLINE認証画面にリダイレクトする
 *
 * POST /api/auth/line/login
 *
 * Request Body:
 * - inviteToken?: string - 招待トークン（招待経由の場合）
 *
 * Response:
 * - 302 Redirect: LINE認証URLへリダイレクト
 * - 400/500 Error: エラー詳細付きJSONレスポンス
 */

interface LoginRequest {
  inviteToken?: string;
  disableAutoLogin?: boolean; // 自動ログイン無効化フラグ
}

/**
 * POST /api/auth/line/login
 * LINE認証フローを開始
 */
export async function POST(request: NextRequest) {
  try {
    // LINE認証設定の妥当性チェック
    const configCheck = validateLineAuthConfig();
    if (!configCheck.isValid) {
      secureLog('error', 'LINE authentication configuration is invalid', {
        errors: configCheck.errors,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication service is not properly configured',
          details: configCheck.errors,
        },
        { status: 500 }
      );
    }

    // リクエストボディの解析
    let requestData: LoginRequest = {};
    try {
      const body = await request.text();
      if (body.trim()) {
        requestData = JSON.parse(body);
      }
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body format',
        },
        { status: 400 }
      );
    }

    // CSRF防止用のstateを生成
    const state = generateState(32);

    // セッション管理用の情報をCookieに保存
    const sessionData = {
      state,
      createdAt: Date.now(),
      inviteToken: requestData.inviteToken || undefined,
    };

    // LINE認証URLを生成（自動ログイン無効化フラグを適用）
    const authUrl = generateLineAuthUrl(
      state,
      requestData.inviteToken,
      requestData.disableAutoLogin || false
    );

    // レスポンスを作成してセッション情報をCookieに設定
    const response = NextResponse.redirect(authUrl, { status: 302 });

    // セッション情報をCookieに保存（一時的、認証完了まで）
    setSessionCookie(response, JSON.stringify(sessionData));

    secureAuthLog('LINE authentication flow initiated', {
      hasInviteToken: !!requestData.inviteToken,
      state: state,
      hasAuthUrl: !!authUrl,
    });

    return response;
  } catch (error) {
    secureLog('error', 'LINE authentication initiation error', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate authentication',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/line/login
 * ログイン開始（GETリクエスト対応）
 * URLパラメータから招待トークンを取得
 */
export async function GET(request: NextRequest) {
  try {
    // LINE認証設定の妥当性チェック
    const configCheck = validateLineAuthConfig();
    if (!configCheck.isValid) {
      secureLog('error', 'LINE authentication configuration is invalid', {
        errors: configCheck.errors,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication service is not properly configured',
          details: configCheck.errors,
        },
        { status: 500 }
      );
    }

    // URLパラメータから招待トークン、リダイレクト先、自動ログイン設定を取得
    const { searchParams } = new URL(request.url);
    const inviteToken = searchParams.get('invite') || undefined;
    const redirectUrl = searchParams.get('redirect') || '/'; // 認証後の戻り先
    const disableAutoLogin = searchParams.get('disable_auto_login') === 'true'; // 自動ログイン無効化フラグ

    // CSRF防止用のstateを生成
    const state = generateState(32);

    // セッション管理用の情報をCookieに保存（リダイレクト先も含める）
    const sessionData = {
      state,
      createdAt: Date.now(),
      inviteToken,
      redirectUrl, // 認証完了後の戻り先を保存
    };

    // LINE認証URLを生成（自動ログイン無効化フラグを適用）
    const authUrl = generateLineAuthUrl(state, inviteToken, disableAutoLogin);

    // レスポンスを作成してセッション情報をCookieに設定
    const response = NextResponse.redirect(authUrl, { status: 302 });

    // セッション情報をCookieに保存（一時的、認証完了まで）
    setSessionCookie(response, JSON.stringify(sessionData));

    secureAuthLog('LINE authentication flow initiated via GET', {
      hasInviteToken: !!inviteToken,
      state: state,
      hasAuthUrl: !!authUrl,
    });

    return response;
  } catch (error) {
    secureLog('error', 'LINE authentication initiation error (GET)', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate authentication',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/auth/line/login
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
