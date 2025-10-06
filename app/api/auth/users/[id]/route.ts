import type { User } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateFromRequest } from "@/lib/auth/middleware";
import type { ApiResponse } from "@/lib/auth/types";
import { prisma } from "@/lib/db";

/**
 * 個別ユーザー管理API
 *
 * 機能:
 * - GET: ユーザー詳細取得
 * - PUT: ユーザー情報更新（権限・アクティブ状態）
 * - DELETE: ユーザー無効化（論理削除）
 */

// ユーザー詳細レスポンス型
type UserDetailResponse = Pick<
  User,
  "id" | "displayName" | "role" | "isActive" | "createdAt" | "updatedAt"
> & {
  invitationCount: number; // 作成した招待数
};

// ユーザー更新リクエストスキーマ
const updateUserSchema = z
  .object({
    role: z.enum(["ADMIN", "MANAGER", "MEMBER"]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.role !== undefined || data.isActive !== undefined, {
    message: "At least one field (role or isActive) must be provided",
  });

/**
 * GET /api/auth/users/[id] - ユーザー詳細取得
 *
 * 権限: ADMIN または MANAGER
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<UserDetailResponse>>> {
  try {
    // パラメータ解決
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // 認証チェック
    const authResult = await authenticateFromRequest(request);
    if (!(authResult.success && authResult.user)) {
      return NextResponse.json(
        {
          success: false,
          error: "$1",
        },
        { status: 401 }
      );
    }

    // 権限チェック（管理者・マネージャーのみ、または自分自身）
    const isOwnProfile = authResult.user.id === id;
    const hasManagementPermission = ["ADMIN", "MANAGER"].includes(
      authResult.user.role
    );

    if (!(isOwnProfile || hasManagementPermission)) {
      return NextResponse.json(
        {
          success: false,
          error: "$1",
        },
        { status: 403 }
      );
    }

    // ユーザー詳細取得
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdInvitations: {
          select: { token: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "$1",
        },
        { status: 404 }
      );
    }

    const response: UserDetailResponse = {
      id: user.id,
      displayName: user.displayName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      invitationCount: user.createdInvitations.length,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: null,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/users/[id] - ユーザー情報更新
 *
 * 更新可能フィールド:
 * - role: ユーザー権限（ADMIN, MANAGER, MEMBER）
 * - isActive: アクティブ状態
 *
 * 権限: ADMIN のみ
 * 制限: 自分自身の権限は変更不可
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<UserDetailResponse>>> {
  try {
    // パラメータ解決
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // 認証チェック
    const authResult = await authenticateFromRequest(request);
    if (!(authResult.success && authResult.user)) {
      return NextResponse.json(
        {
          success: false,
          error: "$1",
        },
        { status: 401 }
      );
    }

    // 権限チェック（管理者のみ）
    if (authResult.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "$1",
        },
        { status: 403 }
      );
    }

    // 自分自身の編集チェック
    if (authResult.user.id === id) {
      return NextResponse.json(
        {
          success: false,
          error: "$1",
        },
        { status: 400 }
      );
    }

    // リクエストボディ解析
    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "$1",
        },
        { status: 400 }
      );
    }

    // バリデーション
    const validationResult = updateUserSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "$1",
        },
        { status: 400 }
      );
    }

    const { role, isActive } = validationResult.data;

    // ユーザー存在確認
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, displayName: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "$1",
        },
        { status: 404 }
      );
    }

    // ユーザー情報更新
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        displayName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdInvitations: {
          select: { token: true },
        },
      },
    });

    const response: UserDetailResponse = {
      id: updatedUser.id,
      displayName: updatedUser.displayName,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      invitationCount: updatedUser.createdInvitations.length,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: null,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/users/[id] - ユーザー無効化
 *
 * 物理削除ではなく isActive を false にする論理削除
 *
 * 権限: ADMIN のみ
 * 制限: 自分自身は削除不可
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  try {
    // パラメータ解決
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // 認証チェック
    const authResult = await authenticateFromRequest(request);
    if (!(authResult.success && authResult.user)) {
      return NextResponse.json(
        {
          success: false,
          error: "$1",
        },
        { status: 401 }
      );
    }

    // 権限チェック（管理者のみ）
    if (authResult.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "$1",
        },
        { status: 403 }
      );
    }

    // 自分自身の削除チェック
    if (authResult.user.id === id) {
      return NextResponse.json(
        {
          success: false,
          error: "$1",
        },
        { status: 400 }
      );
    }

    // ユーザー存在確認
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, displayName: true, isActive: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "$1",
        },
        { status: 404 }
      );
    }

    // 既に無効化済みかチェック
    if (!existingUser.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "$1",
        },
        { status: 400 }
      );
    }

    // ユーザー無効化（論理削除）
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: null,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
