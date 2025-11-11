/**
 * レスポンシブデザイン関連の定数
 */

/**
 * レスポンシブデザインのブレークポイント
 * Tailwind CSS のデフォルトブレークポイントと一致
 */
export const BREAKPOINTS = Object.freeze({
  /** スマートフォン (640px以上) - Tailwind の sm ブレークポイント */
  SM: 640,
  /** タブレット (768px以上) - Tailwind の md ブレークポイント */
  MD: 768,
  /** ノートPC (1024px以上) - Tailwind の lg ブレークポイント */
  LG: 1024,
  /** デスクトップ (1280px以上) - Tailwind の xl ブレークポイント */
  XL: 1280,
  /** 大画面デスクトップ (1536px以上) - Tailwind の 2xl ブレークポイント */
  "2XL": 1536,
} as const);

/**
 * モバイルデバイスの判定に使用するブレークポイント
 * 640px未満をモバイルとして扱う
 */
export const MOBILE_BREAKPOINT = BREAKPOINTS.SM;
