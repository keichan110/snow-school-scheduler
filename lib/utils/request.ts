import { NextRequest } from 'next/server';

/**
 * リクエストからクライアントIPを取得
 * X-Forwarded-For > X-Real-IP > request.ip > ローカルデフォルト
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ip = forwardedFor
      .split(',')
      .map((value) => value.trim())
      .find((value) => value.length > 0);
    if (ip) {
      return ip;
    }
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp && realIp.trim().length > 0) {
    return realIp.trim();
  }

  const requestWithIp = request as NextRequest & { ip?: string | null };
  const requestIp = requestWithIp.ip;
  if (typeof requestIp === 'string' && requestIp.trim().length > 0) {
    return requestIp.trim();
  }

  return '127.0.0.1';
}

/**
 * リクエストヘッダーからUser-Agentを取得
 */
export function getRequestUserAgent(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent');
  if (userAgent && userAgent.trim().length > 0) {
    return userAgent;
  }
  return 'unknown';
}
