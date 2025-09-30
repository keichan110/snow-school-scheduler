import { type NextRequest, NextResponse } from "next/server";
import {
  type AuthenticatedUser,
  authenticateFromRequest,
} from "@/lib/auth/middleware";

/**
 * ユーザー情報取得API
 * 認証されたユーザーの詳細情報を取得する
 *
 * GET /api/auth/me
 *
 * Headers (Required):
 * - Cookie: auth-token=<JWT> - 認証トークン
 * or
 * - Authorization: Bearer <JWT> - 認証トークン
 *
 * Response:
 * - 200 OK: ユーザー情報取得成功
 * - 401 Unauthorized: 認証失敗（トークン無効・未認証）
 * - 403 Forbidden: アカウント無効
 * - 500 Internal Server Error: システムエラー
 */

/**
 * ユーザー情報レスポンス型
 */
export interface UserInfoResponse {
  success: true;
  user: AuthenticatedUser;
}

/**
 * エラーレスポンス型
 */
export interface ErrorResponse {
  success: false;
  error: string;
  statusCode?: number;
}

/**
 * GET /api/auth/me
 * 認証されたユーザーの情報を取得
 */
export async function GET(request: NextRequest) {
  try {
    // 認証トークンの検証とユーザー情報取得
    const authResult = await authenticateFromRequest(request);

    if (!(authResult.success && authResult.user)) {
      console.log("❌ Authentication failed:", {
        error: authResult.error,
        statusCode: authResult.statusCode,
      });

      const response: ErrorResponse = {
        success: false,
        error: authResult.error || "Authentication failed",
        ...(authResult.statusCode && { statusCode: authResult.statusCode }),
      };

      return NextResponse.json(response, {
        status: authResult.statusCode || 401,
      });
    }

    const user = authResult.user;

    // デバッグモードでのみログ出力
    if (process.env.NODE_ENV === "development") {
      console.log("✅ User authenticated:", user.displayName);
    }

    // ユーザー情報レスポンス
    const response: UserInfoResponse = {
      success: true,
      user: {
        id: user.id,
        lineUserId: user.lineUserId,
        displayName: user.displayName,
        profileImageUrl: user.profileImageUrl ?? null,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    console.error("❌ User info retrieval failed");

    const response: ErrorResponse = {
      success: false,
      error: "Failed to retrieve user information",
      statusCode: 500,
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/auth/me
 * ユーザー情報の部分更新（表示名のみ更新可能）
 */
export async function POST(request: NextRequest) {
  try {
    console.log("📝 User info update request initiated");

    // 認証チェック
    const authResult = await authenticateFromRequest(request);

    if (!(authResult.success && authResult.user)) {
      console.log("❌ Authentication failed for update:", {
        error: authResult.error,
        statusCode: authResult.statusCode,
      });

      const response: ErrorResponse = {
        success: false,
        error: authResult.error || "Authentication failed",
        ...(authResult.statusCode && { statusCode: authResult.statusCode }),
      };

      return NextResponse.json(response, {
        status: authResult.statusCode || 401,
      });
    }

    // リクエストボディの解析
    let requestData: { displayName?: string } = {};
    try {
      const body = await request.text();
      if (body.trim()) {
        requestData = JSON.parse(body);
      }
    } catch (parseError) {
      console.error("❌ Invalid request body format:", parseError);
      const response: ErrorResponse = {
        success: false,
        error: "Invalid request body format",
        statusCode: 400,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 表示名の更新のみ許可
    if (
      !requestData.displayName ||
      typeof requestData.displayName !== "string"
    ) {
      const response: ErrorResponse = {
        success: false,
        error: "Display name is required and must be a string",
        statusCode: 400,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 表示名の長さ制限
    if (
      requestData.displayName.trim().length === 0 ||
      requestData.displayName.length > 50
    ) {
      const response: ErrorResponse = {
        success: false,
        error: "Display name must be between 1 and 50 characters",
        statusCode: 400,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const user = authResult.user;
    const newDisplayName = requestData.displayName.trim();

    // 同じ表示名の場合は更新をスキップ
    if (user.displayName === newDisplayName) {
      console.log("📝 Display name unchanged, skipping update:", {
        userId: user.id,
        displayName: newDisplayName,
      });

      const response: UserInfoResponse = {
        success: true,
        user,
      };
      return NextResponse.json(response, { status: 200 });
    }

    // データベースの動的インポート（Prismaクライアント）
    const { prisma } = await import("@/lib/db");

    // 表示名を更新
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { displayName: newDisplayName },
    });

    console.log("✅ User display name updated successfully:", {
      userId: updatedUser.id,
      oldDisplayName: user.displayName,
      newDisplayName: updatedUser.displayName,
    });

    // 更新されたユーザー情報をレスポンス型に変換
    const updatedAuthUser: AuthenticatedUser = {
      id: updatedUser.id,
      lineUserId: updatedUser.lineUserId,
      displayName: updatedUser.displayName,
      profileImageUrl: updatedUser.profileImageUrl,
      role: updatedUser.role as "ADMIN" | "MANAGER" | "MEMBER",
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    const response: UserInfoResponse = {
      success: true,
      user: updatedAuthUser,
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    console.error("❌ User info update failed");

    const response: ErrorResponse = {
      success: false,
      error: "Failed to update user information",
      statusCode: 500,
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000",
    "https://localhost:3000",
  ].filter(Boolean); // undefined環境変数を除去

  if (!(origin && allowedOrigins.includes(origin))) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
