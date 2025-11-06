/**
 * パスパラメータの数値IDをバリデーションしてパース
 *
 * @param value - パラメータ文字列
 * @returns パース結果とエラーメッセージ
 */
export function validateNumericId(value: string): {
  isValid: boolean;
  parsedValue: number | null;
  error: string | null;
} {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return {
      isValid: false,
      parsedValue: null,
      error: `Invalid ID format: expected numeric value, got "${value}"`,
    };
  }

  if (parsed <= 0) {
    return {
      isValid: false,
      parsedValue: null,
      error: `Invalid ID value: expected positive integer, got ${parsed}`,
    };
  }

  return {
    isValid: true,
    parsedValue: parsed,
    error: null,
  };
}

/**
 * 日付文字列をバリデーションしてパース
 *
 * @param value - 日付文字列 (YYYY-MM-DD形式を想定)
 * @returns パース結果とエラーメッセージ
 */
export function validateDateString(value: string): {
  isValid: boolean;
  parsedValue: Date | null;
  error: string | null;
} {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      isValid: false,
      parsedValue: null,
      error: `Invalid date format: expected YYYY-MM-DD, got "${value}"`,
    };
  }

  return {
    isValid: true,
    parsedValue: date,
    error: null,
  };
}

/**
 * 必須クエリパラメータが存在するかチェック
 *
 * @param params - 検証するパラメータのオブジェクト
 * @param requiredKeys - 必須のキー配列
 * @returns 検証結果とエラーメッセージ
 */
export function validateRequiredParams(
  params: Record<string, string | null>,
  requiredKeys: string[]
): {
  isValid: boolean;
  missingKeys: string[];
  error: string | null;
} {
  const missingKeys = requiredKeys.filter((key) => !params[key]);

  if (missingKeys.length > 0) {
    return {
      isValid: false,
      missingKeys,
      error: `Missing required parameters: ${missingKeys.join(", ")}`,
    };
  }

  return {
    isValid: true,
    missingKeys: [],
    error: null,
  };
}
