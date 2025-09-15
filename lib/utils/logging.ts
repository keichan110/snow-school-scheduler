/**
 * セキュアログ出力ユーティリティ
 * 機密情報をマスキングしてログ出力する
 */

interface SensitiveData {
  [key: string]: unknown;
}

/**
 * 機密情報をマスクしてログ出力
 */
export function maskSensitiveData(data: SensitiveData): SensitiveData {
  const sensitiveKeys = [
    'token',
    'accesstoken',
    'secret',
    'channelsecret',
    'password',
    'auth',
    'authorization',
    'jwt',
    'code',
    'state',
    'clientsecret',
    'apikey',
  ];

  const masked = { ...data };

  for (const [key, value] of Object.entries(masked)) {
    const keyLower = key.toLowerCase();
    const isSensitive = sensitiveKeys.some((sensitive) =>
      keyLower.includes(sensitive.toLowerCase())
    );

    if (isSensitive && typeof value === 'string') {
      if (value.length <= 8) {
        masked[key] = '****';
      } else {
        masked[key] = `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
      }
    }
  }

  return masked;
}

/**
 * セキュアなログ出力関数
 * 開発環境でのみ機密情報をマスクしてログ出力
 */
export function secureLog(level: 'info' | 'warn' | 'error', message: string, data?: SensitiveData) {
  // 本番環境ではログを出力しない
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const maskedData = data ? maskSensitiveData(data) : undefined;

  switch (level) {
    case 'info':
      console.info(`🛡️ ${message}`, maskedData);
      break;
    case 'warn':
      console.warn(`⚠️ ${message}`, maskedData);
      break;
    case 'error':
      console.error(`❌ ${message}`, maskedData);
      break;
  }
}

/**
 * 認証関連の情報をセキュアにログ出力
 * 機密情報を含む可能性があるデータを安全に記録
 */
export function secureAuthLog(
  message: string,
  data?: {
    hasToken?: boolean;
    hasCode?: boolean;
    hasSecret?: boolean;
    state?: string;
    userId?: string;
    [key: string]: unknown;
  }
) {
  const safeData = data
    ? {
        ...data,
        // state は最初の8文字のみ表示
        state: data.state ? `${data.state.substring(0, 8)}...` : undefined,
      }
    : undefined;

  secureLog('info', `🔐 ${message}`, safeData);
}

/**
 * デバッグ用：設定情報の表示（機密情報は非表示）
 * 開発環境でのトラブルシューティング用
 */
export function logDebugConfig(config: Record<string, unknown>) {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const maskedConfig = maskSensitiveData(config);
  secureLog('info', 'Debug configuration', maskedConfig);
}
