/**
 * 認証・招待システム関連の型定義
 */

// API共通レスポンス型
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// 招待URL作成APIのレスポンス型
export type InvitationUrlData = {
  token: string;
  invitationUrl: string;
  expiresAt: string;
  maxUses: number | null;
  createdBy: string;
};

// 招待URL一覧取得APIのレスポンス型
export type InvitationListItem = {
  token: string;
  description: string; // 修正: descriptionフィールドを追加
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
};

// 招待URL検証APIのレスポンス型
export type InvitationValidationData = {
  isValid: boolean;
  error?: string;
  errorCode?: "NOT_FOUND" | "EXPIRED" | "INACTIVE" | "MAX_USES_EXCEEDED";
};

// 招待URL作成リクエスト型
export type CreateInvitationRequest = {
  expiresInHours?: number; // 1-8760 (1時間〜1年)
  maxUses?: number; // 1-1000回
};

// ユーザー情報型（JWT由来）
export type AuthenticatedUser = {
  userId: string;
  lineUserId: string;
  displayName: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
  isActive: boolean;
};
