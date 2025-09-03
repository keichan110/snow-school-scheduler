/**
 * 招待管理API クライアント
 */

import type {
  InvitationTokenWithStats,
  CreateInvitationRequest,
  InvitationApiResponse,
} from './types';

const API_BASE_URL = '/api/auth/invitations';

/**
 * 招待トークン一覧取得
 */
export async function fetchInvitations(): Promise<InvitationTokenWithStats[]> {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
    credentials: 'include', // Cookieベースの認証
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`招待一覧の取得に失敗しました: ${response.status}`);
  }

  const result: InvitationApiResponse<InvitationTokenWithStats[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || '招待一覧の取得に失敗しました');
  }

  return result.data;
}

/**
 * 招待トークン作成
 */
export async function createInvitation(
  data: CreateInvitationRequest
): Promise<InvitationTokenWithStats> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    credentials: 'include', // Cookieベースの認証
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`招待の作成に失敗しました: ${response.status}`);
  }

  // APIは InvitationUrlData 型を返すので、InvitationTokenWithStats 型に変換
  const result: InvitationApiResponse<{
    token: string;
    invitationUrl: string;
    expiresAt: string;
    maxUses: number | null;
    createdBy: string;
  }> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || '招待の作成に失敗しました');
  }

  // APIレスポンスをフロントエンド用の型に変換
  const apiData = result.data;
  const convertedData: InvitationTokenWithStats = {
    token: apiData.token,
    description: data.description || '',
    expiresAt: new Date(apiData.expiresAt),
    isActive: true, // 新規作成時は必ずアクティブ
    maxUses: apiData.maxUses,
    usageCount: 0, // 新規作成時は使用回数0
    remainingUses: apiData.maxUses || 0,
    createdAt: new Date(),
    createdBy: apiData.createdBy,
    invitationUrl: apiData.invitationUrl, // 招待URLを含める
  };

  return convertedData;
}

/**
 * 招待トークン無効化
 */
export async function deactivateInvitation(token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${token}`, {
    method: 'DELETE',
    credentials: 'include', // Cookieベースの認証
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`招待の無効化に失敗しました: ${response.status}`);
  }

  const result: InvitationApiResponse<void> = await response.json();

  if (!result.success) {
    throw new Error(result.error || '招待の無効化に失敗しました');
  }
}
