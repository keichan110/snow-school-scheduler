import { headers } from "next/headers";

/**
 * 権限不足時のリダイレクト先
 * 将来的に変更可能な定数として定義
 */
export const ACCESS_DENIED_REDIRECT = "/";

/**
 * 現在のパスを取得
 * Next.js App Router の Server Components から現在のパスを取得する
 *
 * TODO: デプロイ環境でヘッダー実測を行い、最適なキーを確定する
 * - 開発環境と本番環境でヘッダーが異なる可能性がある
 * - `x-url`, `x-forwarded-url`, `x-original-uri` などを試す
 * - ステージング環境での動作確認が必要
 *
 * @returns 現在のパス（pathname + search）
 *
 * @example
 * ```typescript
 * const currentPath = await resolveCurrentPath();
 * // "/users?page=2"
 * ```
 */
export async function resolveCurrentPath(): Promise<string> {
  const headersList = await headers();

  // 環境によって異なるヘッダーを試行
  const url = headersList.get("x-url") ?? headersList.get("x-forwarded-url");
  if (url) {
    try {
      const parsed = new URL(url);
      return parsed.pathname + parsed.search;
    } catch {
      // URL パースに失敗した場合はフォールバック
    }
  }

  // x-forwarded-proto と x-forwarded-host から構築を試みる
  const proto = headersList.get("x-forwarded-proto");
  const host = headersList.get("x-forwarded-host");
  const path = headersList.get("x-original-uri") ?? "/";

  if (proto && host) {
    try {
      const constructed = new URL(path, `${proto}://${host}`);
      return constructed.pathname + constructed.search;
    } catch {
      // URL 構築に失敗した場合はフォールバック
    }
  }

  // フォールバック: パスのみ返却
  return path;
}

/**
 * ログインリダイレクトURL構築
 * 未認証ユーザーをログインページへリダイレクトする際のURLを生成
 *
 * @param returnTo - リダイレクト後の戻り先URL（省略時は現在のパス）
 * @returns ログインページURL（`/login?redirect=...`）
 *
 * @example
 * ```typescript
 * // 現在のパスを使用
 * const loginUrl = await buildLoginRedirectUrl();
 * // "/login?redirect=%2Fusers"
 *
 * // 明示的にパスを指定
 * const loginUrl = await buildLoginRedirectUrl("/dashboard");
 * // "/login?redirect=%2Fdashboard"
 * ```
 */
export async function buildLoginRedirectUrl(
  returnTo?: string
): Promise<string> {
  const targetPath = returnTo ?? (await resolveCurrentPath());
  const encoded = encodeURIComponent(targetPath);
  return `/login?redirect=${encoded}`;
}
