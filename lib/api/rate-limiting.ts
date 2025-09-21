/**
 * Rate Limiting Implementation
 * メモリベースのRate Limiting（開発・小規模運用向け）
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface RateLimitConfig {
  windowMs: number; // 時間窓（ミリ秒）
  maxRequests: number; // 最大リクエスト数
}

type RateLimitRule =
  | {
      id: string;
      type: 'regex';
      pattern: RegExp;
      config: RateLimitConfig;
    }
  | {
      id: string;
      type: 'exact';
      path: string;
      config: RateLimitConfig;
    }
  | {
      id: string;
      type: 'prefix';
      prefix: string;
      config: RateLimitConfig;
    };

// メモリベースのストレージ
const rateLimitStore = new Map<string, RateLimitEntry>();

// ルール設定（上から順にマッチを評価）
const RATE_LIMIT_RULES: RateLimitRule[] = [
  {
    id: 'auth-invitation-verify',
    type: 'regex',
    pattern: /^\/api\/auth\/invitations\/[^/]+\/verify$/,
    config: { windowMs: 60 * 1000, maxRequests: 5 }, // 1分に5回
  },
  {
    id: 'auth-line-login',
    type: 'exact',
    path: '/api/auth/line/login',
    config: { windowMs: 60 * 1000, maxRequests: 5 }, // 1分に5回
  },
  {
    id: 'auth-general',
    type: 'prefix',
    prefix: '/api/auth/',
    config: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 15分に10回
  },
  {
    id: 'api-general',
    type: 'prefix',
    prefix: '/api/',
    config: { windowMs: 60 * 1000, maxRequests: 100 }, // 1分に100回
  },
];

function findRateLimitRule(pathname: string): RateLimitRule {
  if (RATE_LIMIT_RULES.length === 0) {
    throw new Error('Rate limit rules are not configured');
  }

  for (const rule of RATE_LIMIT_RULES) {
    switch (rule.type) {
      case 'exact':
        if (pathname === rule.path) {
          return rule;
        }
        break;
      case 'prefix':
        if (pathname.startsWith(rule.prefix)) {
          return rule;
        }
        break;
      case 'regex':
        if (rule.pattern.test(pathname)) {
          return rule;
        }
        break;
    }
  }

  // 最後のルールはフォールバック
  const fallbackRule = RATE_LIMIT_RULES[RATE_LIMIT_RULES.length - 1];
  if (!fallbackRule) {
    throw new Error('Rate limit fallback rule not found');
  }
  return fallbackRule;
}

/**
 * IPアドレスとルールIDから識別子を生成
 */
function generateIdentifier(ip: string, ruleId: string): string {
  const sanitizedIp = ip || '127.0.0.1';
  return `${ruleId}|${sanitizedIp}`;
}

function extractRuleIdFromKey(key: string): string {
  const [ruleId] = key.split('|');
  return ruleId ?? 'unknown';
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
  ruleId: string;
} {
  // 定期的なクリーンアップ（10%の確率で実行）
  if (Math.random() < 0.1) {
    cleanupExpiredEntries();
  }

  const rule = findRateLimitRule(pathname);
  const identifier = generateIdentifier(ip, rule.id);
  const config = rule.config;
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
      ruleId: rule.id,
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
    ruleId: rule.id,
  };
}

/**
 * 現在のRate Limit状況を取得（デバッグ用）
 */
export function getRateLimitStatus(): {
  totalEntries: number;
  buckets: Record<string, number>;
} {
  const buckets: Record<string, number> = {};

  for (const key of rateLimitStore.keys()) {
    const ruleId = extractRuleIdFromKey(key);
    buckets[ruleId] = (buckets[ruleId] ?? 0) + 1;
  }

  return {
    totalEntries: rateLimitStore.size,
    buckets,
  };
}

/**
 * Rate Limitストレージをクリア（テスト用）
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}
