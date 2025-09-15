/**
 * 招待管理画面の型定義
 */

export interface InvitationTokenWithStats {
  token: string;
  description: string;
  expiresAt: Date | null;
  isActive: boolean;
  maxUses: number | null;
  usageCount: number;
  remainingUses: number;
  createdAt: Date;
  createdBy: string;
  invitationUrl?: string; // 新規作成時のみ含まれる
}

export interface CreateInvitationRequest {
  description?: string;
  expiresAt: string; // 必須に変更
}

export interface InvitationFormData {
  description: string;
  expiresAt: Date; // 必須に変更
}

export interface InvitationStats {
  total: number;
  active: number;
  expired: number;
  used: number;
}

export interface InvitationApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
