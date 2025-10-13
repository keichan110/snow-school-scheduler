/**
 * Server Actions の統一レスポンス型
 * すべての Server Actions は成功時に data を返し、失敗時に error を返す
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * API Response 型（既存との互換性維持）
 * 従来の API Routes との互換性を保つための型定義
 */
export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  message: string | null;
  error: string | null;
};

/**
 * 認証済みユーザー型
 * JWT トークンから抽出されたユーザー情報
 */
export type AuthenticatedUser = {
  /** ユーザーID (cuid形式) */
  id: string;
  /** LINEユーザーID */
  lineUserId: string;
  /** 表示名 */
  displayName: string;
  /** プロフィール画像URL */
  profileImageUrl: string | null;
  /** ユーザー権限 */
  role: "ADMIN" | "MANAGER" | "MEMBER";
};
