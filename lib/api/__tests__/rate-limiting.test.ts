/**
 * Rate Limiting Test
 */

import { checkRateLimit, clearRateLimitStore, getRateLimitStatus } from '../rate-limiting';

describe('Rate Limiting', () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  it('should allow requests within limit', () => {
    const ip = '127.0.0.1';
    const pathname = '/api/health';

    // 最初のリクエストは許可
    const result1 = checkRateLimit(ip, pathname);
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(99); // 100 - 1
    expect(result1.limit).toBe(100);

    // 2回目のリクエストも許可
    const result2 = checkRateLimit(ip, pathname);
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(98); // 100 - 2
  });

  it('should block requests when limit exceeded', () => {
    const ip = '127.0.0.1';
    const pathname = '/api/health';

    // 制限まで送信
    for (let i = 0; i < 100; i++) {
      const result = checkRateLimit(ip, pathname);
      expect(result.allowed).toBe(true);
    }

    // 101回目は拒否
    const result = checkRateLimit(ip, pathname);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should apply different limits for auth APIs', () => {
    const ip = '127.0.0.1';
    const authPath = '/api/auth/login';

    // 認証APIは15分に10回の制限
    for (let i = 0; i < 10; i++) {
      const result = checkRateLimit(ip, authPath);
      expect(result.allowed).toBe(true);
    }

    // 11回目は拒否
    const result = checkRateLimit(ip, authPath);
    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(10);
  });

  it('should track different IPs separately', () => {
    const pathname = '/api/health';

    // IP1は制限に達する
    for (let i = 0; i < 100; i++) {
      checkRateLimit('192.168.1.1', pathname);
    }
    const result1 = checkRateLimit('192.168.1.1', pathname);
    expect(result1.allowed).toBe(false);

    // IP2は新しいカウンター
    const result2 = checkRateLimit('192.168.1.2', pathname);
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(99);
  });

  it('should provide rate limit status', () => {
    checkRateLimit('127.0.0.1', '/api/health');
    checkRateLimit('127.0.0.1', '/api/auth/login');

    const status = getRateLimitStatus();
    expect(status.totalEntries).toBe(2);
    expect(status.generalEntries).toBe(1);
    expect(status.authEntries).toBe(1);
  });
});
