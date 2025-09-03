import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db';
import { ApiResponse } from '@/lib/auth/types';

/**
 * 有効な招待チェックAPI
 *
 * GET /api/auth/invitations/active
 * - 現在有効な招待があるかチェック
 * - 管理者・マネージャーのみアクセス可能
 *
 * @returns 有効な招待がある場合は招待データ、ない場合は404
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{
  token: string;
  description: string;
  expiresAt: Date;
  isActive: boolean;
  maxUses: number | null;
  usageCount: number;
  remainingUses: number | null;
  createdAt: Date;
  createdBy: string;
}>>> {
  try {
    // 認証トークン取得
    const { getAuthTokenFromRequest } = await import('@/lib/auth/middleware');
    const token = getAuthTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication token required' },
        { status: 401 }
      );
    }

    const user = extractUserFromToken(token);

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

    // 現在時刻
    const now = new Date();

    // 有効な招待をチェック
    const activeInvitation = await prisma.invitationToken.findFirst({
      where: {
        isActive: true,
        expiresAt: { gt: now },
      },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!activeInvitation) {
      return NextResponse.json(
        { success: false, error: 'No active invitation found' },
        { status: 404 }
      );
    }

    // フロントエンド用の形式に変換
    const responseData = {
      token: activeInvitation.token,
      description: activeInvitation.description || '',
      expiresAt: activeInvitation.expiresAt,
      isActive: activeInvitation.isActive,
      maxUses: activeInvitation.maxUses,
      usageCount: activeInvitation.usedCount,
      remainingUses: activeInvitation.maxUses ? activeInvitation.maxUses - activeInvitation.usedCount : null,
      createdAt: activeInvitation.createdAt,
      createdBy: activeInvitation.creator.displayName,
    };

    console.log('✅ Active invitation found:', {
      token: activeInvitation.token.substring(0, 16) + '...',
      description: activeInvitation.description,
      expiresAt: activeInvitation.expiresAt.toISOString(),
      usedCount: activeInvitation.usedCount,
    });

    return NextResponse.json(
      { success: true, data: responseData },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Active invitation check failed:', error);

    let errorMessage = 'Failed to check active invitation';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}