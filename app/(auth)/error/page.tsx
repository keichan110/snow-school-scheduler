import {
  authErrorMap,
  sanitizeDescription,
} from "@/features/auth/lib/auth-error-map";
import { AuthErrorClient } from "@/features/auth/ui/auth-error-client";

type AuthErrorPageProps = {
  searchParams: Promise<{
    error?: string;
    description?: string;
    reason?: string;
  }>;
};

/**
 * 認証エラーページ（Server Component）
 *
 * LINE認証エラー、権限エラー、セッションエラーなどを表示
 * サーバー側でクエリパラメータを解析し、エラー情報をクライアントに渡す
 */
export default async function AuthErrorPage({
  searchParams,
}: AuthErrorPageProps) {
  const params = await searchParams;
  const error = params.error || params.reason || "unknown";
  const description = sanitizeDescription(params.description || "");

  const errorInfo = authErrorMap(error);

  return (
    <AuthErrorClient {...errorInfo} description={description} error={error} />
  );
}
