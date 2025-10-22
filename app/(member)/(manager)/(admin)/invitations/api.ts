/**
 * 招待管理API クライアント（READ専用）
 * Write操作はServer Actionsを使用してください
 */

import { HTTP_STATUS_NOT_FOUND } from "@/constants/http-status";
import type { InvitationApiResponse, InvitationTokenWithStats } from "./types";

const API_BASE_URL = "/api/auth/invitations";

export async function checkActiveInvitation(): Promise<InvitationTokenWithStats | null> {
  const response = await fetch(`${API_BASE_URL}/active`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === HTTP_STATUS_NOT_FOUND) {
      return null;
    }
    throw new Error(`有効な招待のチェックに失敗しました: ${response.status}`);
  }

  const result: InvitationApiResponse<InvitationTokenWithStats> =
    await response.json();

  if (!result.success) {
    throw new Error(result.error || "有効な招待のチェックに失敗しました");
  }

  return result.data || null;
}

export async function fetchInvitations(): Promise<InvitationTokenWithStats[]> {
  const response = await fetch(API_BASE_URL, {
    method: "GET",
    credentials: "include", // Cookieベースの認証
    headers: {
      "Content-Type": "application/json",
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

  if (!(result.success && result.data)) {
    throw new Error(result.error || "招待一覧の取得に失敗しました");
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
