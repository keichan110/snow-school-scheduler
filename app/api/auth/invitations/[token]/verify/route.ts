import { NextRequest, NextResponse } from 'next/server';
import { validateInvitationToken } from '@/lib/auth/invitations';
import { ApiResponse, InvitationValidationData } from '@/lib/auth/types';

/**
 * 招待URL検証API
 *
 * GET /api/auth/invitations/[token]/verify
 * - 認証不要（招待URL確認のため）
 * - 招待URLの有効性を確認する
 * - 有効期限・使用回数チェック
 *
 * @example
 * ```bash
 * curl -X GET http://localhost:3000/api/auth/invitations/inv_abc123/verify
 * ```
 */

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
): Promise<NextResponse<ApiResponse<InvitationValidationData>>> {
  try {
    const { token } = await context.params;

    // トークンパラメータの基本チェック
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Token parameter is required' },
        { status: 400 }
      );
    }

    // URL デコード（必要に応じて）
    const decodedToken = decodeURIComponent(token.trim());

    console.log('🔍 Validating invitation token:', {
      originalToken: token,
      decodedToken,
      requestUrl: request.url,
    });

    // 招待トークン検証実行
    const validationResult = await validateInvitationToken(decodedToken);

    if (validationResult.isValid) {
      // 有効なトークンの場合
      const responseData: InvitationValidationData = {
        isValid: true,
      };

      if (validationResult.token) {
        console.log('✅ Invitation token is valid:', {
          token: validationResult.token.token,
          expiresAt: validationResult.token.expiresAt,
        });
      } else {
        console.log('✅ Invitation token is valid (token meta unavailable)');
      }

      return NextResponse.json({ success: true, data: responseData }, { status: 200 });
    } else {
      // 無効なトークンの場合
      let statusCode = 400; // デフォルトは400

      // エラーコードに応じてステータスコードを調整
      switch (validationResult.errorCode) {
        case 'NOT_FOUND':
          statusCode = 404;
          break;
        case 'EXPIRED':
        case 'INACTIVE':
        case 'MAX_USES_EXCEEDED':
          statusCode = 410; // Gone - リソースは存在していたが現在は利用不可
          break;
        default:
          statusCode = 400;
      }

      console.log('❌ Invitation token validation failed:', {
        token: decodedToken,
        error: validationResult.error,
        errorCode: validationResult.errorCode,
        statusCode,
      });

      const errorMessage = validationResult.error || 'Invalid invitation token';
      const errorResponse: ApiResponse<InvitationValidationData> = {
        success: false,
        error: errorMessage,
      };

      return NextResponse.json(errorResponse, { status: statusCode });
    }
  } catch (error) {
    console.error('❌ Invitation token verification failed:', error);

    let errorMessage = 'Failed to verify invitation token';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
