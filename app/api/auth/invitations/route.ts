import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  type CreateInvitationTokenParams,
  createInvitationToken,
  getInvitationTokensByCreator,
} from "@/lib/auth/invitations";
import { authenticateFromRequest, checkUserRole } from "@/lib/auth/middleware";
import type {
  ApiResponse,
  InvitationListItem,
  InvitationUrlData,
} from "@/lib/auth/types";
import { prisma } from "@/lib/db";

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
  description: z.string().optional(),
  expiresAt: z.string(), // 必須 - ISO 8601形式の日付文字列
});

type CreateInvitationRequest = z.infer<typeof createInvitationSchema>;

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<InvitationUrlData>>> {
  try {
    const authResult = await authenticateFromRequest(request);
    if (!(authResult.success && authResult.user)) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error ?? "Authentication required",
        },
        { status: authResult.statusCode ?? 401 }
      );
    }

    const roleResult = checkUserRole(authResult.user, "MANAGER");
    if (!(roleResult.success && roleResult.user)) {
      return NextResponse.json(
        {
          success: false,
          error:
            roleResult.error ??
            "Insufficient permissions. Admin or Manager role required.",
        },
        { status: roleResult.statusCode ?? 403 }
      );
    }

    const user = roleResult.user;

    // リクエストボディの解析とバリデーション
    let requestBody: CreateInvitationRequest;
    try {
      const body = await request.json();
      requestBody = createInvitationSchema.parse(body);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid request body. Expected: { description?: string, expiresAt: string }",
        },
        { status: 400 }
      );
    }

    // 有効期限のバリデーション（最大1ヶ月）
    const expiresAt = new Date(requestBody.expiresAt);
    const maxExpiryDate = new Date();
    maxExpiryDate.setMonth(maxExpiryDate.getMonth() + 1);

    if (expiresAt > maxExpiryDate) {
      return NextResponse.json(
        { success: false, error: "有効期限は最大1ヶ月までです" },
        { status: 400 }
      );
    }

    if (expiresAt <= new Date()) {
      return NextResponse.json(
        { success: false, error: "有効期限は現在時刻より後に設定してください" },
        { status: 400 }
      );
    }

    // 招待トークン作成パラメータの準備
    const createParams: CreateInvitationTokenParams = {
      createdBy: user.id,
      ...(requestBody.description && { description: requestBody.description }),
      expiresAt,
    };

    // 招待トークン生成（内部で既存の有効招待を自動無効化）
    const invitationToken = await createInvitationToken(createParams);

    // ベースURLの取得（環境変数または リクエストヘッダーから）
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // 招待URLの生成
    const invitationUrl = `${baseUrl}/login?invite=${encodeURIComponent(invitationToken.token)}`;

    // レスポンスデータの構築
    const responseData: ApiResponse<InvitationUrlData> = {
      success: true,
      data: {
        token: invitationToken.token,
        invitationUrl,
        expiresAt: invitationToken.expiresAt.toISOString(),
        maxUses: invitationToken.maxUses,
        createdBy: invitationToken.creator.displayName,
      },
    };

    console.log("✅ Invitation URL created successfully:", {
      createdBy: user.displayName,
      role: user.role,
      expiresAt: invitationToken.expiresAt.toISOString(),
      maxUses: invitationToken.maxUses,
      url: invitationUrl,
    });

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error("❌ Invitation URL creation failed:", error);

    // 具体的なエラーメッセージの処理
    let errorMessage = "Failed to create invitation URL";
    if (error instanceof Error) {
      // 既知のエラーパターンを識別
      if (error.message.includes("Invalid user ID")) {
        errorMessage = "User not found or inactive";
      } else if (error.message.includes("Insufficient permissions")) {
        errorMessage = "Insufficient permissions to create invitations";
      } else if (error.message.includes("Failed to generate unique")) {
        errorMessage =
          "System error: Unable to generate unique invitation token";
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
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
    const authResult = await authenticateFromRequest(request);
    if (!(authResult.success && authResult.user)) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error ?? "Authentication required",
        },
        { status: authResult.statusCode ?? 401 }
      );
    }

    const roleResult = checkUserRole(authResult.user, "MANAGER");
    if (!(roleResult.success && roleResult.user)) {
      return NextResponse.json(
        {
          success: false,
          error:
            roleResult.error ??
            "Insufficient permissions. Admin or Manager role required.",
        },
        { status: roleResult.statusCode ?? 403 }
      );
    }

    const user = roleResult.user;

    // クエリパラメータの解析
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const showAll =
      user.role === "ADMIN" && searchParams.get("showAll") === "true";

    // 招待トークン一覧取得
    // ADMIN: showAll=trueの場合は全トークン、そうでなければ自分作成のみ
    // MANAGER: 自分が作成したトークンのみ

    let tokens;
    if (showAll && user.role === "ADMIN") {
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
          createdAt: "desc",
        },
      });
    } else {
      // 自分が作成した招待トークンのみ取得
      tokens = await getInvitationTokensByCreator(user.id, includeInactive);
    }

    // 現在時刻
    const now = new Date();

    // レスポンスデータの構築
    const invitationList: InvitationListItem[] = tokens.map((token) => {
      const isExpired = token.expiresAt <= now;
      const remainingUses = token.maxUses
        ? token.maxUses - token.usedCount
        : null;

      return {
        token: token.token,
        description: token.description || "", // 修正: descriptionフィールドを追加
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

    console.log("✅ Invitation tokens retrieved successfully:", {
      requestedBy: user.displayName,
      role: user.role,
      showAll: showAll && user.role === "ADMIN",
      includeInactive,
      tokenCount: invitationList.length,
      activeTokens: invitationList.filter((t) => t.isActive && !t.isExpired)
        .length,
    });

    const responseData: ApiResponse<InvitationListItem[]> = {
      success: true,
      data: invitationList,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Invitation tokens retrieval failed:", error);

    let errorMessage = "Failed to retrieve invitation tokens";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
