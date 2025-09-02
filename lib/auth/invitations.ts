import { randomBytes, createHash } from 'crypto';
import { prisma } from '@/lib/db';

/**
 * 招待トークン関連のユーティリティ関数
 * セキュアな招待URL生成・検証・管理機能を提供
 */

/**
 * 招待トークンの設定
 */
export const invitationConfig = {
  /** トークンの長さ（バイト数） */
  tokenLength: 32,
  /** デフォルトの有効期限（時間） */
  defaultExpiryHours: 168, // 7日間
  /** デフォルトの最大使用回数 */
  defaultMaxUses: 10,
  /** トークンプレフィックス（識別用） */
  tokenPrefix: 'inv_',
} as const;

/**
 * 招待トークン作成時のパラメータ
 */
export interface CreateInvitationTokenParams {
  /** 招待を作成するユーザーID */
  createdBy: string;
  /** 招待の説明（任意） */
  description?: string;
  /** 有効期限（必須）。Dateオブジェクトまたは時間数での指定 */
  expiresAt?: Date;
  expiresInHours?: number;
}

/**
 * 招待トークンの詳細情報
 */
export interface InvitationTokenDetails {
  token: string;
  expiresAt: Date;
  isActive: boolean;
  createdBy: string;
  maxUses: number | null;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    displayName: string;
    role: string;
  };
}

/**
 * 招待トークン検証結果
 */
export interface TokenValidationResult {
  isValid: boolean;
  token?: InvitationTokenDetails;
  error?: string;
  errorCode?: 'NOT_FOUND' | 'EXPIRED' | 'INACTIVE' | 'MAX_USES_EXCEEDED';
}

/**
 * セキュアな招待トークンを生成
 *
 * @returns 生成されたトークン文字列
 */
function generateSecureToken(): string {
  // 32バイトのランダムデータを生成
  const randomData = randomBytes(invitationConfig.tokenLength);

  // SHA-256ハッシュを生成して16進数文字列に変換
  const hash = createHash('sha256').update(randomData).digest('hex');

  // プレフィックスを付けて返す
  return invitationConfig.tokenPrefix + hash;
}

/**
 * 招待トークンを作成
 *
 * @param params - 招待トークン作成パラメータ
 * @returns 作成された招待トークンの詳細
 *
 * @example
 * ```typescript
 * const invitation = await createInvitationToken({
 *   createdBy: "cluuid_admin123",
 *   expiresInHours: 24, // 24時間後に期限切れ
 *   maxUses: 5 // 最大5回まで使用可能
 * });
 *
 * console.log(`招待URL: /login?invite=${invitation.token}`);
 * ```
 */
export async function createInvitationToken(
  params: CreateInvitationTokenParams
): Promise<InvitationTokenDetails> {
  const {
    createdBy,
    description,
    expiresAt,
    expiresInHours = invitationConfig.defaultExpiryHours,
  } = params;

  // 作成者が存在し、権限があることを確認
  const creator = await prisma.user.findUnique({
    where: { id: createdBy },
    select: { id: true, displayName: true, role: true, isActive: true },
  });

  if (!creator) {
    throw new Error('Invalid user ID: Creator not found');
  }

  if (!creator.isActive) {
    throw new Error('Inactive user cannot create invitation tokens');
  }

  if (creator.role !== 'ADMIN' && creator.role !== 'MANAGER') {
    throw new Error('Insufficient permissions: Only ADMIN or MANAGER can create invitations');
  }

  // 一意なトークンを生成（衝突を避けるために最大5回試行）
  let token: string;
  let attempts = 0;
  const maxAttempts = 5;

  do {
    token = generateSecureToken();
    attempts++;

    // 既存のトークンと衝突していないかチェック
    const existingToken = await prisma.invitationToken.findUnique({
      where: { token },
    });

    if (!existingToken) {
      break;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique invitation token');
    }
  } while (attempts < maxAttempts);

  // 有効期限を計算
  const finalExpiresAt =
    expiresAt ||
    (() => {
      const date = new Date();
      date.setHours(date.getHours() + expiresInHours);
      return date;
    })();

  // データベースに保存
  const invitationToken = await prisma.invitationToken.create({
    data: {
      token,
      ...(description && { description }),
      expiresAt: finalExpiresAt,
      createdBy,
      maxUses: null, // 使用回数制限なし
      usedCount: 0,
      isActive: true,
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

  console.log('✅ Invitation token created:', {
    token: token.substring(0, 16) + '...',
    createdBy: creator.displayName,
    expiresAt: finalExpiresAt.toISOString(),
    description: description || 'No description',
  });

  return {
    ...invitationToken,
    creator: {
      id: creator.id,
      displayName: creator.displayName,
      role: creator.role,
    },
  };
}

/**
 * 招待トークンの有効性を検証
 *
 * @param token - 検証する招待トークン
 * @returns 検証結果
 *
 * @example
 * ```typescript
 * const result = await validateInvitationToken("inv_abc123...");
 *
 * if (result.isValid) {
 *   console.log("有効な招待トークンです");
 *   // 招待を使用してユーザー登録処理を継続
 * } else {
 *   console.error("招待トークンエラー:", result.error);
 *   // エラーページにリダイレクト
 * }
 * ```
 */
export async function validateInvitationToken(token: string): Promise<TokenValidationResult> {
  try {
    // トークン形式の基本チェック
    if (!token || typeof token !== 'string') {
      return {
        isValid: false,
        error: 'Invalid token format',
        errorCode: 'NOT_FOUND',
      };
    }

    // プレフィックスチェック
    if (!token.startsWith(invitationConfig.tokenPrefix)) {
      return {
        isValid: false,
        error: 'Invalid token prefix',
        errorCode: 'NOT_FOUND',
      };
    }

    // データベースからトークンを取得
    const invitationToken = await prisma.invitationToken.findUnique({
      where: { token },
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
      return {
        isValid: false,
        error: 'Invitation token not found',
        errorCode: 'NOT_FOUND',
      };
    }

    // アクティブ状態チェック
    if (!invitationToken.isActive) {
      return {
        isValid: false,
        error: 'Invitation token is disabled',
        errorCode: 'INACTIVE',
        token: invitationToken,
      };
    }

    // 有効期限チェック
    const now = new Date();
    if (invitationToken.expiresAt <= now) {
      return {
        isValid: false,
        error: 'Invitation token has expired',
        errorCode: 'EXPIRED',
        token: invitationToken,
      };
    }

    // すべてのチェックを通過
    return {
      isValid: true,
      token: invitationToken,
    };
  } catch (error) {
    console.error('❌ Invitation token validation error:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

/**
 * 招待トークンの使用回数を増加
 * ユーザー登録成功時に呼び出される
 *
 * @param token - 使用する招待トークン
 * @returns 更新された招待トークンの詳細
 *
 * @example
 * ```typescript
 * // ユーザー登録成功後
 * const updatedToken = await incrementTokenUsage("inv_abc123...");
 * console.log(`使用回数: ${updatedToken.usedCount}/${updatedToken.maxUses}`);
 * ```
 */
export async function incrementTokenUsage(token: string): Promise<InvitationTokenDetails> {
  // まず有効性を確認
  const validation = await validateInvitationToken(token);

  if (!validation.isValid) {
    throw new Error(`Cannot increment usage: ${validation.error}`);
  }

  // 使用回数を増加
  const updatedToken = await prisma.invitationToken.update({
    where: { token },
    data: {
      usedCount: {
        increment: 1,
      },
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

  console.log('📊 Invitation token usage incremented:', {
    token: token.substring(0, 16) + '...',
    usedCount: updatedToken.usedCount,
    maxUses: updatedToken.maxUses,
    remaining: updatedToken.maxUses ? updatedToken.maxUses - updatedToken.usedCount : '無制限',
  });

  return updatedToken;
}

/**
 * 招待トークンを無効化
 * 管理者が手動で招待を取り消す際に使用
 *
 * @param token - 無効化する招待トークン
 * @param deactivatedBy - 無効化を実行するユーザーID
 * @returns 無効化された招待トークンの詳細
 *
 * @example
 * ```typescript
 * await deactivateInvitationToken("inv_abc123...", "admin_user_id");
 * console.log("招待トークンが無効化されました");
 * ```
 */
export async function deactivateInvitationToken(
  token: string,
  deactivatedBy: string
): Promise<InvitationTokenDetails> {
  // 無効化を実行するユーザーの権限を確認
  const user = await prisma.user.findUnique({
    where: { id: deactivatedBy },
    select: { role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    throw new Error('Invalid user: Cannot deactivate invitation token');
  }

  if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
    throw new Error('Insufficient permissions: Only ADMIN or MANAGER can deactivate invitations');
  }

  // トークンを無効化
  const updatedToken = await prisma.invitationToken.update({
    where: { token },
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

  console.log('🚫 Invitation token deactivated:', {
    token: token.substring(0, 16) + '...',
    deactivatedBy,
  });

  return updatedToken;
}

/**
 * 作成者による招待トークン一覧取得
 *
 * @param createdBy - 作成者のユーザーID
 * @param includeInactive - 無効なトークンも含めるか
 * @returns 招待トークンの一覧
 */
export async function getInvitationTokensByCreator(
  createdBy: string,
  includeInactive: boolean = false
): Promise<InvitationTokenDetails[]> {
  const tokens = await prisma.invitationToken.findMany({
    where: {
      createdBy,
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

  return tokens;
}

/**
 * 有効期限切れの招待トークンをクリーンアップ
 * 定期実行用のユーティリティ関数
 *
 * @returns クリーンアップされたトークン数
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const now = new Date();

  const result = await prisma.invitationToken.updateMany({
    where: {
      expiresAt: {
        lte: now,
      },
      isActive: true,
    },
    data: {
      isActive: false,
      updatedAt: now,
    },
  });

  if (result.count > 0) {
    console.log(`🧹 Cleaned up ${result.count} expired invitation tokens`);
  }

  return result.count;
}

/**
 * 招待URL生成ヘルパー
 *
 * @param token - 招待トークン
 * @param baseUrl - ベースURL（省略時は相対URL）
 * @returns 完全な招待URL
 */
export function generateInvitationUrl(token: string, baseUrl?: string): string {
  const path = `/login?invite=${encodeURIComponent(token)}`;
  return baseUrl ? new URL(path, baseUrl).toString() : path;
}
