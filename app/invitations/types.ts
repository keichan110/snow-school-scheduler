/**
 * 招待管理画面の型定義
 */

export type InvitationTokenWithStats = {
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
};

export type CreateInvitationRequest = {
  description?: string;
  expiresAt: string; // 必須に変更
};

export type InvitationFormData = {
  description: string;
  expiresAt: Date; // 必須に変更
};

export type InvitationStats = {
  total: number;
  active: number;
  expired: number;
  used: number;
};

export type InvitationApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
