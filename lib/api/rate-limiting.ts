/**
 * Rate Limiting Implementation
 * メモリベースのRate Limiting（開発・小規模運用向け）
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number; // 時間窓（ミリ秒）
  maxRequests: number; // 最大リクエスト数
}

// メモリベースのストレージ
const rateLimitStore = new Map<string, RateLimitEntry>();

// 設定
const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  '/api/auth/': { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 15分に10回
  '/api/': { windowMs: 60 * 1000, maxRequests: 100 }, // 1分に100回
};

/**
 * IPアドレスとパスから識別子を生成
 */
function generateIdentifier(ip: string, pathname: string): string {
  // 認証APIは特別扱い
  if (pathname.startsWith('/api/auth/')) {
    return `auth:${ip}`;
  }
  return `general:${ip}`;
}

/**
 * 適用するRate Limit設定を取得
 */
function getRateLimitConfig(pathname: string): RateLimitConfig {
  if (pathname.startsWith('/api/auth/')) {
    return (
      RATE_LIMIT_CONFIGS['/api/auth/'] ??
      RATE_LIMIT_CONFIGS['/api/'] ?? { windowMs: 15 * 60 * 1000, maxRequests: 10 }
    );
  }
  return RATE_LIMIT_CONFIGS['/api/'] ?? { windowMs: 60 * 1000, maxRequests: 100 };
}

/**
 * 期限切れエントリをクリーンアップ
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Rate Limitチェックを実行
 */
export function checkRateLimit(
  ip: string,
  pathname: string
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  limit: number;
} {
  // 定期的なクリーンアップ（10%の確率で実行）
  if (Math.random() < 0.1) {
    cleanupExpiredEntries();
  }

  const identifier = generateIdentifier(ip, pathname);
  const config = getRateLimitConfig(pathname);
  const now = Date.now();
  const resetTime = now + config.windowMs;

  // 既存エントリを取得または新規作成
  let entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // 新しい時間窓の開始
    entry = {
      count: 1,
      resetTime,
    };
    rateLimitStore.set(identifier, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
      limit: config.maxRequests,
    };
  }

  // 既存の時間窓内
  entry.count++;

  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    limit: config.maxRequests,
  };
}

/**
 * 現在のRate Limit状況を取得（デバッグ用）
 */
export function getRateLimitStatus(): {
  totalEntries: number;
  authEntries: number;
  generalEntries: number;
} {
  let authEntries = 0;
  let generalEntries = 0;

  for (const key of rateLimitStore.keys()) {
    if (key.startsWith('auth:')) {
      authEntries++;
    } else {
      generalEntries++;
    }
  }

  return {
    totalEntries: rateLimitStore.size,
    authEntries,
    generalEntries,
  };
}

/**
 * Rate Limitストレージをクリア（テスト用）
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}
