/**
 * 共通定数のエクスポート
 * プロジェクト全体で使用される定数を一元管理
 */

export {
  HTTP_STATUS,
  type HttpStatusCode,
  isClientError,
  isServerError,
  isSuccessStatus,
} from "./http-status";
