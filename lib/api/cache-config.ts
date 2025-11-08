/**
 * APIキャッシュ設定の定数定義
 *
 * @description
 * React QueryやSWRなどのデータフェッチングライブラリで使用する
 * キャッシュ時間の設定を一元管理します。
 */

/**
 * ミリ秒単位の時間計算用ヘルパー定数
 */
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

/**
 * シフトデータ用キャッシュ設定
 *
 * @description
 * シフトデータは頻繁に更新される可能性があるため、
 * 比較的短いキャッシュ時間を設定しています。
 */
export const SHIFT_CACHE_CONFIG = {
  /**
   * staleTime: データが新鮮とみなされる期間（2分）
   *
   * この期間内は、キャッシュされたデータを使用し、
   * 新たなリクエストは発行されません。
   */
  STALE_TIME_MS: MS_PER_SECOND * SECONDS_PER_MINUTE * 2,

  /**
   * gcTime: キャッシュがメモリに保持される期間（5分）
   *
   * この期間を過ぎると、キャッシュはガベージコレクションの対象となります。
   */
  GC_TIME_MS: MS_PER_SECOND * SECONDS_PER_MINUTE * 5,
} as const;

/**
 * フォームデータ用キャッシュ設定
 *
 * @description
 * フォームデータ（部門、シフト種別など）は比較的変更頻度が低いため、
 * 長めのキャッシュ時間を設定しています。
 */
export const FORM_DATA_CACHE_CONFIG = {
  /** staleTime: 5分 */
  STALE_TIME_MS: MS_PER_SECOND * SECONDS_PER_MINUTE * 5,

  /** gcTime: 10分 */
  GC_TIME_MS: MS_PER_SECOND * SECONDS_PER_MINUTE * 10,
} as const;

/**
 * インストラクターデータ用キャッシュ設定
 *
 * @description
 * インストラクターデータは中程度の変更頻度を想定しています。
 */
export const INSTRUCTOR_CACHE_CONFIG = {
  /** staleTime: 3分 */
  STALE_TIME_MS: MS_PER_SECOND * SECONDS_PER_MINUTE * 3,

  /** gcTime: 5分 */
  GC_TIME_MS: MS_PER_SECOND * SECONDS_PER_MINUTE * 5,
} as const;
