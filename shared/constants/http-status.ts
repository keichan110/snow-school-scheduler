/**
 * HTTPステータスコード定数
 * RFC 9110に基づく標準HTTPステータスコード定義
 *
 * @see https://www.rfc-editor.org/rfc/rfc9110.html#name-status-codes
 */

/**
 * HTTPステータスコード定数オブジェクト
 * マジックナンバーを排除し、型安全性と可読性を向上
 */
export const HTTP_STATUS = {
  // 2xx Success
  /** 200 OK - リクエスト成功 */
  OK: 200,
  /** 201 Created - リソース作成成功 */
  CREATED: 201,
  /** 202 Accepted - リクエスト受理（処理未完了） */
  ACCEPTED: 202,
  /** 204 No Content - 成功（レスポンスボディなし） */
  NO_CONTENT: 204,

  // 3xx Redirection
  /** 301 Moved Permanently - 恒久的なリダイレクト */
  MOVED_PERMANENTLY: 301,
  /** 302 Found - 一時的なリダイレクト */
  FOUND: 302,
  /** 303 See Other - 別のURIを参照 */
  SEE_OTHER: 303,
  /** 304 Not Modified - 変更なし（キャッシュ有効） */
  NOT_MODIFIED: 304,
  /** 307 Temporary Redirect - 一時的リダイレクト（メソッド保持） */
  TEMPORARY_REDIRECT: 307,
  /** 308 Permanent Redirect - 恒久的リダイレクト（メソッド保持） */
  PERMANENT_REDIRECT: 308,

  // 4xx Client Errors
  /** 400 Bad Request - リクエスト不正 */
  BAD_REQUEST: 400,
  /** 401 Unauthorized - 認証が必要 */
  UNAUTHORIZED: 401,
  /** 403 Forbidden - アクセス権限なし */
  FORBIDDEN: 403,
  /** 404 Not Found - リソース未検出 */
  NOT_FOUND: 404,
  /** 405 Method Not Allowed - HTTPメソッド不許可 */
  METHOD_NOT_ALLOWED: 405,
  /** 409 Conflict - リソース競合 */
  CONFLICT: 409,
  /** 422 Unprocessable Entity - 処理不可能なエンティティ */
  UNPROCESSABLE_ENTITY: 422,
  /** 429 Too Many Requests - リクエスト過多 */
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Errors
  /** 500 Internal Server Error - サーバー内部エラー */
  INTERNAL_SERVER_ERROR: 500,
  /** 501 Not Implemented - 未実装 */
  NOT_IMPLEMENTED: 501,
  /** 502 Bad Gateway - 不正なゲートウェイ */
  BAD_GATEWAY: 502,
  /** 503 Service Unavailable - サービス利用不可 */
  SERVICE_UNAVAILABLE: 503,
  /** 504 Gateway Timeout - ゲートウェイタイムアウト */
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * HTTPステータスコードの型定義
 * HTTP_STATUSオブジェクトの値の型
 */
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

/**
 * HTTPステータスコード範囲定数
 */
const STATUS_RANGES = {
  SUCCESS_MIN: 200,
  SUCCESS_MAX: 300,
  CLIENT_ERROR_MIN: 400,
  CLIENT_ERROR_MAX: 500,
  SERVER_ERROR_MIN: 500,
  SERVER_ERROR_MAX: 600,
} as const;

/**
 * ステータスコードが成功（2xx）かチェック
 *
 * @param status - HTTPステータスコード
 * @returns 2xxの場合true
 *
 * @example
 * ```typescript
 * isSuccessStatus(200) // true
 * isSuccessStatus(201) // true
 * isSuccessStatus(404) // false
 * ```
 */
export const isSuccessStatus = (status: number): boolean =>
  status >= STATUS_RANGES.SUCCESS_MIN && status < STATUS_RANGES.SUCCESS_MAX;

/**
 * ステータスコードがクライアントエラー（4xx）かチェック
 *
 * @param status - HTTPステータスコード
 * @returns 4xxの場合true
 *
 * @example
 * ```typescript
 * isClientError(400) // true
 * isClientError(404) // true
 * isClientError(500) // false
 * ```
 */
export const isClientError = (status: number): boolean =>
  status >= STATUS_RANGES.CLIENT_ERROR_MIN &&
  status < STATUS_RANGES.CLIENT_ERROR_MAX;

/**
 * ステータスコードがサーバーエラー（5xx）かチェック
 *
 * @param status - HTTPステータスコード
 * @returns 5xxの場合true
 *
 * @example
 * ```typescript
 * isServerError(500) // true
 * isServerError(503) // true
 * isServerError(404) // false
 * ```
 */
export const isServerError = (status: number): boolean =>
  status >= STATUS_RANGES.SERVER_ERROR_MIN &&
  status < STATUS_RANGES.SERVER_ERROR_MAX;
