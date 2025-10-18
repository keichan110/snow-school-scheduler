/**
 * 認証機能モジュール
 * サーバー・クライアントコンポーネント、ユーティリティをエクスポート
 */

export type { AuthErrorInfo } from "./lib/auth-error-map";
// Utilities
export { authErrorMap, sanitizeDescription } from "./lib/auth-error-map";
export type { InviteTokenResolution } from "./server/resolve-invite-token";
// Server-side utilities
export { resolveInviteToken } from "./server/resolve-invite-token";
export type { AuthErrorClientProps } from "./ui/auth-error-client";
// Client components
export { AuthErrorClient } from "./ui/auth-error-client";
export type { SignupPageClientProps } from "./ui/signup-page-client";
export { SignupPageClient } from "./ui/signup-page-client";
