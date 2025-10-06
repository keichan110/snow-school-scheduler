import { type NextRequest, NextResponse } from "next/server";
import { authenticateFromRequest, checkUserRole } from "@/lib/auth/middleware";
import type { ApiResponse } from "@/lib/auth/types";
import {
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_OK,
} from "@/shared/constants/http-status";
import { checkAuthAndRole } from "../utils";
import {
  checkDeactivationPermission,
  checkTokenActive,
  deactivateToken,
  fetchInvitationToken,
  identifyDeletionError,
  validateTokenParameter,
} from "./utils";

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

type DeactivationResponse = {
  message: string;
  token: string;
  deactivatedAt: string;
  deactivatedBy: string;
};

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
): Promise<NextResponse<ApiResponse<DeactivationResponse>>> {
  try {
    const { token } = await context.params;

    // 認証とロールチェック
    const authResult = await authenticateFromRequest(request);
    const roleResult = checkUserRole(authResult.user, "MANAGER");
    const authCheck = checkAuthAndRole(authResult, roleResult);

    if (!authCheck.success) {
      return authCheck.response;
    }

    const user = authCheck.user;

    // トークンパラメータのバリデーション
    const tokenValidation = validateTokenParameter(token);
    if (!tokenValidation.success) {
      return tokenValidation.response;
    }

    const decodedToken = tokenValidation.decodedToken;

    // 対象の招待トークンを取得
    const tokenFetch = await fetchInvitationToken(decodedToken);
    if (!tokenFetch.success) {
      return tokenFetch.response;
    }

    const invitationToken = tokenFetch.invitationToken;

    // 権限チェック - 作成者または管理者のみ無効化可能
    const permissionCheck = checkDeactivationPermission(user, invitationToken);
    if (!permissionCheck.success) {
      return permissionCheck.response;
    }

    // 既に無効化済みの場合
    const activeCheck = checkTokenActive(invitationToken);
    if (!activeCheck.success) {
      return activeCheck.response;
    }

    // 招待トークンを論理削除（無効化）
    const deactivatedToken = await deactivateToken(decodedToken);

    const responseData: DeactivationResponse = {
      message: "Invitation token deactivated successfully",
      token: deactivatedToken.token,
      deactivatedAt: deactivatedToken.updatedAt.toISOString(),
      deactivatedBy: user.displayName,
    };

    return NextResponse.json(
      { success: true, data: responseData },
      { status: HTTP_STATUS_OK }
    );
  } catch (error) {
    const errorMessage = identifyDeletionError(error);

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: HTTP_STATUS_INTERNAL_SERVER_ERROR }
    );
  }
}
