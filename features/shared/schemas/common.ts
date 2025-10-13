import { z } from "zod";

/**
 * 日付文字列スキーマ (YYYY-MM-DD)
 * ISO 8601 形式の日付文字列を検証
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   date: dateStringSchema,
 * });
 * schema.parse({ date: '2024-01-15' }); // OK
 * schema.parse({ date: '2024/01/15' }); // Error
 * ```
 */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD");

/**
 * 正の整数IDスキーマ
 * データベースの自動採番IDを検証
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   id: idSchema,
 * });
 * schema.parse({ id: 1 }); // OK
 * schema.parse({ id: 0 }); // Error (must be positive)
 * schema.parse({ id: -1 }); // Error (must be positive)
 * ```
 */
export const idSchema = z.number().int().positive();

/**
 * オプショナルな文字列（空文字をnullに変換）
 * フォームの任意入力フィールドなどで使用
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   description: optionalStringSchema,
 * });
 * schema.parse({ description: 'text' }); // { description: 'text' }
 * schema.parse({ description: '' }); // { description: null }
 * schema.parse({}); // { description: null }
 * ```
 */
export const optionalStringSchema = z
  .string()
  .optional()
  .transform((val) => val || null);

/**
 * アクティブ状態スキーマ
 * リソースの有効/無効状態を管理
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   isActive: isActiveSchema,
 * });
 * schema.parse({}); // { isActive: true } (デフォルト)
 * schema.parse({ isActive: false }); // { isActive: false }
 * ```
 */
export const isActiveSchema = z.boolean().default(true);

/**
 * ステータス列挙型（instructors用）
 * インストラクターの勤務状態を管理
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   status: instructorStatusSchema,
 * });
 * schema.parse({ status: 'ACTIVE' }); // OK
 * schema.parse({ status: 'INVALID' }); // Error
 * ```
 */
export const instructorStatusSchema = z.enum(["ACTIVE", "INACTIVE", "RETIRED"]);
