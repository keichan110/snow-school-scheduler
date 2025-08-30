/**
 * 認証・招待システム関連の型定義
 */

// API共通レスポンス型
export type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

// 招待URL作成APIのレスポンス型
export interface InvitationUrlData {
  token: string;
  invitationUrl: string;
  expiresAt: string;
  maxUses: number | null;
  createdBy: string;
}

// 招待URL作成リクエスト型
export interface CreateInvitationRequest {
  expiresInHours?: number; // 1-8760 (1時間〜1年)
  maxUses?: number; // 1-1000回
}

// ユーザー情報型（JWT由来）
export interface AuthenticatedUser {
  userId: string;
  lineUserId: string;
  displayName: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  isActive: boolean;
}
