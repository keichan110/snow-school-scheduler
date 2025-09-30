// 共通API型定義

/**
 * 標準APIレスポンス形式
 */
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data: T | null;
  readonly count?: number;
  readonly message: string | null;
  readonly error: string | null;
}

/**
 * APIエラー情報
 */
export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

/**
 * ページネーション情報
 */
export interface PaginationInfo {
  readonly page: number;
  readonly perPage: number;
  readonly total: number;
  readonly totalPages: number;
}

/**
 * ページネーション対応APIレスポンス
 */
export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T> {
  readonly pagination: PaginationInfo;
}

/**
 * API成功レスポンス作成用ヘルパー型
 */
export type ApiSuccessResponse<T = unknown> = {
  readonly success: true;
  readonly data: T;
  readonly count?: number;
  readonly message: string | null;
  readonly error: null;
};

/**
 * APIエラーレスポンス作成用ヘルパー型
 */
export type ApiErrorResponse = {
  readonly success: false;
  readonly data: null;
  readonly message: null;
  readonly error: string;
};

/**
 * HTTP ステータスコード
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * APIエラータイプ
 */
export enum ApiErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  CONFLICT = "CONFLICT",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

/**
 * 共通リクエストパラメータ
 */
export interface BaseQueryParams {
  readonly page?: number;
  readonly perPage?: number;
  readonly sortBy?: string;
  readonly sortOrder?: "asc" | "desc";
}

/**
 * バリデーションエラー詳細
 */
export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code?: string;
}
