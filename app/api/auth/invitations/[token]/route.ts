import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db';
import { ApiResponse } from '@/lib/auth/types';

/**
 * 招待URL無効化API
 *
 * DELETE /api/auth/invitations/[token]
 * - 管理者・マネージャーのみアクセス可能
 * - 招待URLを論理削除（無効化）する
 * - 作成者または管理者のみ無効化可能
 *
 * @example
 * ```bash
 * curl -X DELETE http://localhost:3000/api/auth/invitations/inv_abc123 \
 *   -H "Authorization: Bearer <JWT_TOKEN>"
 * ```
 */

interface RouteParams {
  params: {
    token: string;
  };
}

interface DeactivationResponse {
  message: string;
  token: string;
  deactivatedAt: string;
  deactivatedBy: string;
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<DeactivationResponse>>> {
  try {
    const { token } = params;

    // 認証トークン取得
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication token required' },
        { status: 401 }
      );
    }

    const authToken = authHeader.substring(7); // "Bearer " を除去
    const user = extractUserFromToken(authToken);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // 権限チェック - ADMIN または MANAGER のみ許可
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Admin or Manager role required.' },
        { status: 403 }
      );
    }

    // アクティブユーザーチェック
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'User account is inactive' },
        { status: 403 }
      );
    }

    // トークンパラメータの基本チェック
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Token parameter is required' },
        { status: 400 }
      );
    }

    // URL デコード（必要に応じて）
    const decodedToken = decodeURIComponent(token.trim());

    console.log('🗑️ Attempting to deactivate invitation token:', {
      token: decodedToken,
      requestedBy: user.displayName,
      role: user.role,
    });

    // 対象の招待トークンを取得
    const invitationToken = await prisma.invitationToken.findUnique({
      where: { token: decodedToken },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            role: true,
          },
        },
      },
    });

    if (!invitationToken) {
      return NextResponse.json(
        { success: false, error: 'Invitation token not found' },
        { status: 404 }
      );
    }

    // 権限チェック - 作成者または管理者のみ無効化可能
    const canDeactivate =
      user.role === 'ADMIN' || // 管理者は全ての招待URLを無効化可能
      invitationToken.createdBy === user.userId; // 作成者は自分の招待URLを無効化可能

    if (!canDeactivate) {
      return NextResponse.json(
        {
          success: false,
          error: 'You can only deactivate invitation tokens you created, or you must be an admin',
        },
        { status: 403 }
      );
    }

    // 既に無効化済みの場合
    if (!invitationToken.isActive) {
      return NextResponse.json(
        { success: false, error: 'Invitation token is already inactive' },
        { status: 409 } // Conflict
      );
    }

    // 招待トークンを論理削除（無効化）
    const deactivatedToken = await prisma.invitationToken.update({
      where: { token: decodedToken },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            role: true,
          },
        },
      },
    });

    const responseData: DeactivationResponse = {
      message: 'Invitation token deactivated successfully',
      token: deactivatedToken.token,
      deactivatedAt: deactivatedToken.updatedAt.toISOString(),
      deactivatedBy: user.displayName,
    };

    console.log('✅ Invitation token deactivated successfully:', {
      token: decodedToken,
      originalCreator: invitationToken.creator.displayName,
      deactivatedBy: user.displayName,
      role: user.role,
      deactivatedAt: deactivatedToken.updatedAt,
    });

    return NextResponse.json({ success: true, data: responseData }, { status: 200 });
  } catch (error) {
    console.error('❌ Invitation token deactivation failed:', error);

    let errorMessage = 'Failed to deactivate invitation token';
    if (error instanceof Error) {
      // 既知のエラーパターンを識別
      if (error.message.includes('Record to update not found')) {
        errorMessage = 'Invitation token not found or already deleted';
      } else if (error.message.includes('Unique constraint')) {
        errorMessage = 'Database constraint violation';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
