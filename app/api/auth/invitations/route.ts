import { type NextRequest, NextResponse } from "next/server";
import {
  type CreateInvitationTokenParams,
  createInvitationToken,
} from "@/lib/auth/invitations";
import { authenticateFromRequest } from "@/lib/auth/middleware";
import type {
  ApiResponse,
  InvitationListItem,
  InvitationUrlData,
} from "@/lib/auth/types";
import {
  HTTP_STATUS_CREATED,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_OK,
} from "@/shared/constants/http-status";
import {
  buildInvitationListResponse,
  checkAuthAndRole,
  fetchInvitationTokens,
  identifyErrorMessage,
  parseAndValidateRequest,
  validateExpiry,
} from "./utils";

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
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<InvitationUrlData>>> {
  try {
    // 認証とロールチェック
    const authResult = await authenticateFromRequest(request);
    const authCheck = checkAuthAndRole(authResult, "MANAGER");

    if (!authCheck.success) {
      return authCheck.response;
    }

    const user = authCheck.user;

    // リクエストボディの解析とバリデーション
    const requestValidation = await parseAndValidateRequest(request);
    if (!requestValidation.success) {
      return requestValidation.response;
    }

    const requestBody = requestValidation.data;

    // 有効期限のバリデーション（最大1ヶ月）
    const expiryValidation = validateExpiry(requestBody.expiresAt);
    if (!expiryValidation.success) {
      return expiryValidation.response;
    }

    const expiresAt = expiryValidation.expiresAt;

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

    return NextResponse.json(responseData, { status: HTTP_STATUS_CREATED });
  } catch (error) {
    const errorMessage = identifyErrorMessage(
      error,
      "Failed to create invitation URL"
    );

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: HTTP_STATUS_INTERNAL_SERVER_ERROR }
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
    // 認証とロールチェック
    const authResult = await authenticateFromRequest(request);
    const authCheck = checkAuthAndRole(authResult, "MANAGER");

    if (!authCheck.success) {
      return authCheck.response;
    }

    const user = authCheck.user;

    // クエリパラメータの解析
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const showAll =
      user.role === "ADMIN" && searchParams.get("showAll") === "true";

    // 招待トークン一覧取得
    const tokens = await fetchInvitationTokens(
      user.id,
      user.role,
      includeInactive,
      showAll
    );

    // レスポンスデータの構築
    const invitationList = buildInvitationListResponse(tokens);

    const responseData: ApiResponse<InvitationListItem[]> = {
      success: true,
      data: invitationList,
    };

    return NextResponse.json(responseData, { status: HTTP_STATUS_OK });
  } catch (error) {
    const errorMessage = identifyErrorMessage(
      error,
      "Failed to retrieve invitation tokens"
    );

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: HTTP_STATUS_INTERNAL_SERVER_ERROR }
    );
  }
}
