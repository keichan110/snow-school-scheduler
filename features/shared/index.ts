/**
 * features/shared モジュール
 * Server Actions で使用する共通のユーティリティ、型定義、スキーマをエクスポート
 */

// Auth utilities
export { authenticate, requireAdmin, requireAuth } from "./lib/auth";
// Validation utilities
export { toActionError, validateInput } from "./lib/validation";
// Common schemas
export {
  dateStringSchema,
  idSchema,
  instructorStatusSchema,
  isActiveSchema,
  optionalStringSchema,
} from "./schemas/common";
// Types
export type {
  ActionResult,
  ApiResponse,
  AuthenticatedUser,
} from "./types/actions";
