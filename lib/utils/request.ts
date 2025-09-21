import { NextRequest } from 'next/server';

const TRUSTED_HEADER_CANDIDATES = [
  'cf-connecting-ip',
  'true-client-ip',
  'cf-connecting-ipv6',
] as const;

function sanitizeIpValue(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/[\s\t\n\r]/.test(trimmed)) {
    return null;
  }

  // IPv4 + optional port (e.g. 203.0.113.1 or 203.0.113.1:8080)
  const ipv4Match = trimmed.match(/^([0-9]{1,3}(?:\.[0-9]{1,3}){3})(?::([0-9]{1,5}))?$/);
  if (ipv4Match) {
    const address = ipv4Match[1];
    if (!address) {
      return null;
    }
    const port = ipv4Match[2];
    const segments = address.split('.');
    const isValidSegments = segments.every((segment) => {
      const numeric = Number(segment);
      return numeric >= 0 && numeric <= 255;
    });
    if (!isValidSegments) {
      return null;
    }

    if (port && Number(port) > 65535) {
      return null;
    }

    return address;
  }

  // IPv6 (plain) e.g. 2001:db8::1 or ::ffff:192.0.2.128
  if (/^[0-9A-Fa-f:.]+$/.test(trimmed) && trimmed.length <= 45) {
    return trimmed;
  }

  // IPv6 with brackets and optional port e.g. [2001:db8::1]:443
  const ipv6BracketMatch = trimmed.match(/^\[([0-9A-Fa-f:.]+)\](?::([0-9]{1,5}))?$/);
  if (ipv6BracketMatch) {
    const address = ipv6BracketMatch[1];
    if (!address) {
      return null;
    }
    const port = ipv6BracketMatch[2];
    if (port && Number(port) > 65535) {
      return null;
    }
    if (address.length <= 45 && /^[0-9A-Fa-f:.]+$/.test(address)) {
      return address;
    }
  }

  return null;
}

function extractIpFromHeader(
  request: NextRequest,
  headerName: string,
  options?: { allowMultiple?: boolean }
): string | null {
  const rawValue = request.headers.get(headerName);
  if (!rawValue) {
    return null;
  }

  const values = options?.allowMultiple ? rawValue.split(',') : [rawValue];
  for (const value of values) {
    const sanitized = sanitizeIpValue(value);
    if (sanitized) {
      return sanitized;
    }
  }

  return null;
}

/**
 * リクエストからクライアントIPを取得
 * Cloudflare/Vercelなどの信頼できるヘッダーを優先し、フォールバックとして一般的なヘッダーを使用
 */
export function getClientIp(request: NextRequest): string {
  const requestWithMeta = request as NextRequest & {
    ip?: string | null;
    cf?: { connectingIP?: string } | null;
  };

  const candidateIps: Array<string | null> = [];

  // Cloudflare Workers runtime exposes request.cf.connectingIP
  candidateIps.push(sanitizeIpValue(requestWithMeta.cf?.connectingIP));

  for (const headerName of TRUSTED_HEADER_CANDIDATES) {
    candidateIps.push(extractIpFromHeader(request, headerName));
  }

  candidateIps.push(sanitizeIpValue(requestWithMeta.ip));
  candidateIps.push(extractIpFromHeader(request, 'x-real-ip'));
  candidateIps.push(extractIpFromHeader(request, 'x-forwarded-for', { allowMultiple: true }));

  for (const ip of candidateIps) {
    if (ip) {
      return ip;
    }
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
