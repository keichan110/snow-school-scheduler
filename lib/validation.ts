import { ZodError, type ZodIssue, type ZodSchema } from "zod";
import type { ActionResult } from "@/shared/types/actions";

/**
 * Server Actions 用の安全なバリデーションラッパー
 * Zod スキーマを使用して入力値を検証し、ActionResult 形式で結果を返す
 *
 * @param schema - Zod スキーマ
 * @param input - 検証する入力値
 * @returns 検証結果（成功時は data、失敗時は error）
 *
 * @example
 * ```typescript
 * const createSchema = z.object({
 *   name: z.string().min(1),
 * });
 *
 * export async function createAction(input: unknown) {
 *   const validated = validateInput(createSchema, input);
 *   if (!validated.success) {
 *     return validated; // エラーをそのまま返す
 *   }
 *   // validated.data を使用して処理...
 * }
 * ```
 */
export function validateInput<T>(
  schema: ZodSchema<T>,
  input: unknown
): ActionResult<T> {
  try {
    const validated = schema.parse(input);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.issues.map(
        (e: ZodIssue) => `${e.path.join(".")}: ${e.message}`
      );
      return {
        success: false,
        error: `Validation failed: ${messages.join(", ")}`,
      };
    }
    return { success: false, error: "Validation failed" };
  }
}

/**
 * エラーを ActionResult に変換
 * Server Action 内での例外処理を統一的に扱うためのヘルパー
 *
 * @param error - キャッチされたエラー
 * @returns 失敗を示す ActionResult
 *
 * @example
 * ```typescript
 * export async function myAction() {
 *   try {
 *     // 処理...
 *   } catch (error) {
 *     return toActionError(error);
 *   }
 * }
 * ```
 */
export function toActionError<T = never>(error: unknown): ActionResult<T> {
  if (error instanceof Error) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "Unknown error occurred" };
}
