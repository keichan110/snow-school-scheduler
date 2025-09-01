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
}

export interface CreateInvitationRequest {
  description?: string;
  maxUses?: number;
  expiresAt?: string;
}

export interface InvitationFormData {
  description: string;
  maxUses: number;
  expiresAt: Date | null;
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
