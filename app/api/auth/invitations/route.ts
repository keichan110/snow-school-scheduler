import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromToken } from '@/lib/auth/jwt';
import { createInvitationToken, CreateInvitationTokenParams } from '@/lib/auth/invitations';
import { ApiResponse, InvitationUrlData } from '@/lib/auth/types';
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
    // 認証トークン取得
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // "Bearer " を除去
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
