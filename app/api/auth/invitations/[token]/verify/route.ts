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

    if (validationResult.isValid && validationResult.token) {
      // 有効なトークンの場合
      const tokenData = validationResult.token;
      const remainingUses = tokenData.maxUses ? tokenData.maxUses - tokenData.usedCount : null;

      const responseData: InvitationValidationData = {
        isValid: true,
        token: tokenData.token,
        expiresAt: tokenData.expiresAt.toISOString(),
        maxUses: tokenData.maxUses,
        usedCount: tokenData.usedCount,
        remainingUses,
        createdBy: tokenData.creator.id,
        creatorName: tokenData.creator.displayName,
      };

      console.log('✅ Invitation token is valid:', {
        token: tokenData.token,
        expiresAt: tokenData.expiresAt,
        remainingUses,
        createdBy: tokenData.creator.displayName,
      });

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

      const errorData: InvitationValidationData = {
        isValid: false,
        ...(validationResult.error && { error: validationResult.error }),
        ...(validationResult.errorCode && { errorCode: validationResult.errorCode }),
      };

      // 無効だが詳細情報が利用可能な場合（期限切れ、使用回数超過等）
      if (validationResult.token) {
        const tokenData = validationResult.token;
        errorData.token = tokenData.token;
        errorData.expiresAt = tokenData.expiresAt.toISOString();
        errorData.maxUses = tokenData.maxUses;
        errorData.usedCount = tokenData.usedCount;
        errorData.remainingUses = tokenData.maxUses
          ? tokenData.maxUses - tokenData.usedCount
          : null;
        errorData.createdBy = tokenData.creator.id;
        errorData.creatorName = tokenData.creator.displayName;
      }

      console.log('❌ Invitation token validation failed:', {
        token: decodedToken,
        error: validationResult.error,
        errorCode: validationResult.errorCode,
        statusCode,
      });

      return NextResponse.json(
        { success: false, error: validationResult.error || 'Invalid invitation token' },
        { status: statusCode }
      );
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
