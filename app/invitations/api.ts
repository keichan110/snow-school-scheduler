/**
 * 招待管理API クライアント
 */

import type {
  InvitationTokenWithStats,
  CreateInvitationRequest,
  InvitationApiResponse,
} from './types';

const API_BASE_URL = '/api/auth/invitations';

export async function checkActiveInvitation(): Promise<InvitationTokenWithStats | null> {
  const response = await fetch(`${API_BASE_URL}/active`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`有効な招待のチェックに失敗しました: ${response.status}`);
  }

  const result: InvitationApiResponse<InvitationTokenWithStats> = await response.json();

  if (!result.success) {
    throw new Error(result.error || '有効な招待のチェックに失敗しました');
  }

  return result.data || null;
}

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

  const result: InvitationApiResponse<
    {
      token: string;
      description: string;
      expiresAt: string;
      isActive: boolean;
      maxUses: number | null;
      usedCount: number;
      createdAt: string;
      createdBy: string;
      creatorName: string;
      creatorRole: string;
      isExpired: boolean;
      remainingUses: number | null;
    }[]
  > = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || '招待一覧の取得に失敗しました');
  }

  // APIレスポンスをフロントエンド用の型に変換
  const convertedData: InvitationTokenWithStats[] = result.data.map((item) => ({
    token: item.token,
    description: item.description,
    expiresAt: new Date(item.expiresAt),
    isActive: item.isActive,
    maxUses: item.maxUses,
    usageCount: item.usedCount,
    remainingUses: item.remainingUses || 0, // null を 0 に変換
    createdAt: new Date(item.createdAt),
    createdBy: item.creatorName,
  }));

  return convertedData;
}

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

  // APIレスポンスをフロントエンド用の型に変換
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
    isActive: true,
    maxUses: apiData.maxUses,
    usageCount: 0,
    remainingUses: apiData.maxUses || 0, // null を 0 に変換
    createdAt: new Date(),
    createdBy: apiData.createdBy,
    invitationUrl: apiData.invitationUrl,
  };

  return convertedData;
}

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
