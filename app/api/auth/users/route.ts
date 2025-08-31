import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { authenticateFromRequest } from '@/lib/auth/middleware';
import type { ApiResponse } from '@/lib/auth/types';
import type { User } from '@prisma/client';

/**
 * ユーザー管理API
 *
 * 機能:
 * - GET: ユーザー一覧取得（管理者・マネージャー権限必要）
 * - POST: 現在実装対象外（ユーザー登録は招待システム経由）
 */

// ユーザー一覧レスポンス型
interface UserListResponse {
  users: Array<Pick<User, 'id' | 'displayName' | 'role' | 'isActive' | 'createdAt' | 'updatedAt'>>;
  total: number;
  page: number;
  limit: number;
}

// クエリパラメータのバリデーションスキーマ
const getUsersQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
});

/**
 * GET /api/auth/users - ユーザー一覧取得
 *
 * クエリパラメータ:
 * - page: ページ番号（デフォルト: 1）
 * - limit: 1ページあたりの件数（デフォルト: 20、最大: 100）
 * - role: 権限フィルター（ADMIN, MANAGER, MEMBER）
 * - isActive: アクティブ状態フィルター（true, false）
 * - search: 表示名での部分検索
 *
 * 権限: ADMIN または MANAGER
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<UserListResponse>>> {
  try {
    // 認証チェック
    const authResult = await authenticateFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // 権限チェック（管理者・マネージャーのみアクセス可能）
    if (!['ADMIN', 'MANAGER'].includes(authResult.user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions',
        },
        { status: 403 }
      );
    }

    // クエリパラメータ解析
    const { searchParams } = new URL(request.url);
    const queryResult = getUsersQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
        },
        { status: 400 }
      );
    }

    const { page, limit: limitStr, role, isActive, search } = queryResult.data;

    // ページネーション設定
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limitStr, 10)));
    const skip = (pageNum - 1) * limitNum;

    // フィルター条件構築
    const where: {
      role?: 'ADMIN' | 'MANAGER' | 'MEMBER';
      isActive?: boolean;
      displayName?: { contains: string; mode: 'insensitive' };
    } = {};

    if (role) {
      where.role = role as 'ADMIN' | 'MANAGER' | 'MEMBER';
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search && search.trim()) {
      where.displayName = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    // ユーザー一覧取得（並列実行）
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          displayName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [
          { role: 'asc' }, // 権限順
          { displayName: 'asc' }, // 表示名順
        ],
        skip,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    const response: UserListResponse = {
      users,
      total,
      page: pageNum,
      limit: limitNum,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
