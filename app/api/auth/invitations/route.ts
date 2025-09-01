import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db';
import {
  createInvitationToken,
  CreateInvitationTokenParams,
  getInvitationTokensByCreator,
} from '@/lib/auth/invitations';
import { ApiResponse, InvitationUrlData, InvitationListItem } from '@/lib/auth/types';
import { z } from 'zod';

/**
 * 招待URL作成API
 *
 * POST /api/auth/invitations
 * - 管理者・マネージャーのみアクセス可能
 * - 招待トークンを生成してURLを返す
 *
 * @example
 * ```bash
 * curl -X POST http://localhost:3000/api/auth/invitations \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer <JWT_TOKEN>" \
 *   -d '{"expiresInHours": 24, "maxUses": 5}'
 * ```
 */

// リクエストボディのバリデーションスキーマ
const createInvitationSchema = z.object({
  expiresInHours: z.number().min(1).max(8760).optional(), // 1時間〜1年
  maxUses: z.number().min(1).max(1000).optional(), // 1〜1000回
});

type CreateInvitationRequest = z.infer<typeof createInvitationSchema>;

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<InvitationUrlData>>> {
  try {
    // 認証トークン取得（Cookieまたは Authorization ヘッダー）
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

    // リクエストボディの解析とバリデーション
    let requestBody: CreateInvitationRequest;
    try {
      const body = await request.json();
      requestBody = createInvitationSchema.parse(body);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body. Expected: { expiresInHours?: number, maxUses?: number }',
        },
        { status: 400 }
      );
    }

    // 招待トークン作成パラメータの準備
    const createParams: CreateInvitationTokenParams = {
      createdBy: user.userId,
      ...(requestBody.expiresInHours !== undefined && {
        expiresInHours: requestBody.expiresInHours,
      }),
      ...(requestBody.maxUses !== undefined && { maxUses: requestBody.maxUses }),
    };

    // 招待トークン生成
    const invitationToken = await createInvitationToken(createParams);

    // ベースURLの取得（環境変数または リクエストヘッダーから）
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // 招待URLの生成
    const invitationUrl = `${baseUrl}/login?invite=${encodeURIComponent(invitationToken.token)}`;

    // レスポンスデータの構築
    const responseData: ApiResponse<InvitationUrlData> = {
      success: true,
      data: {
        token: invitationToken.token,
        invitationUrl: invitationUrl,
        expiresAt: invitationToken.expiresAt.toISOString(),
        maxUses: invitationToken.maxUses,
        createdBy: invitationToken.creator.displayName,
      },
    };

    console.log('✅ Invitation URL created successfully:', {
      createdBy: user.displayName,
      role: user.role,
      expiresAt: invitationToken.expiresAt.toISOString(),
      maxUses: invitationToken.maxUses,
      url: invitationUrl,
    });

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('❌ Invitation URL creation failed:', error);

    // 具体的なエラーメッセージの処理
    let errorMessage = 'Failed to create invitation URL';
    if (error instanceof Error) {
      // 既知のエラーパターンを識別
      if (error.message.includes('Invalid user ID')) {
        errorMessage = 'User not found or inactive';
      } else if (error.message.includes('Insufficient permissions')) {
        errorMessage = 'Insufficient permissions to create invitations';
      } else if (error.message.includes('Failed to generate unique')) {
        errorMessage = 'System error: Unable to generate unique invitation token';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

/**
 * 招待URL一覧取得API
 *
 * GET /api/auth/invitations
 * - 管理者・マネージャーのみアクセス可能
 * - 作成した招待URL一覧を取得
 *
 * @example
 * ```bash
 * curl -X GET http://localhost:3000/api/auth/invitations \
 *   -H "Authorization: Bearer <JWT_TOKEN>"
 * ```
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<InvitationListItem[]>>> {
  try {
    // 認証トークン取得（Cookieまたは Authorization ヘッダー）
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

    // クエリパラメータの解析
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const showAll = user.role === 'ADMIN' && searchParams.get('showAll') === 'true';

    // 招待トークン一覧取得
    // ADMIN: showAll=trueの場合は全トークン、そうでなければ自分作成のみ
    // MANAGER: 自分が作成したトークンのみ

    let tokens;
    if (showAll && user.role === 'ADMIN') {
      // 全ユーザーの招待トークンを取得（管理者のみ）
      tokens = await prisma.invitationToken.findMany({
        where: {
          ...(includeInactive ? {} : { isActive: true }),
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
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // 自分が作成した招待トークンのみ取得
      tokens = await getInvitationTokensByCreator(user.userId, includeInactive);
    }

    // 現在時刻
    const now = new Date();

    // レスポンスデータの構築
    const invitationList: InvitationListItem[] = tokens.map((token) => {
      const isExpired = token.expiresAt <= now;
      const remainingUses = token.maxUses ? token.maxUses - token.usedCount : null;

      return {
        token: token.token,
        expiresAt: token.expiresAt.toISOString(),
        isActive: token.isActive,
        maxUses: token.maxUses,
        usedCount: token.usedCount,
        createdAt: token.createdAt.toISOString(),
        createdBy: token.creator.id,
        creatorName: token.creator.displayName,
        creatorRole: token.creator.role,
        isExpired,
        remainingUses,
      };
    });

    console.log('✅ Invitation tokens retrieved successfully:', {
      requestedBy: user.displayName,
      role: user.role,
      showAll: showAll && user.role === 'ADMIN',
      includeInactive,
      tokenCount: invitationList.length,
      activeTokens: invitationList.filter((t) => t.isActive && !t.isExpired).length,
    });

    const responseData: ApiResponse<InvitationListItem[]> = {
      success: true,
      data: invitationList,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('❌ Invitation tokens retrieval failed:', error);

    let errorMessage = 'Failed to retrieve invitation tokens';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
