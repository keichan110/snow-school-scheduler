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

  const result: InvitationApiResponse<InvitationTokenWithStats> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || '招待の作成に失敗しました');
  }

  return result.data;
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

/**
 * 招待URL生成
 */
export function generateInvitationUrl(token: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/api/auth/line/login?invite=${token}`;
}
