import { isIP, isIPv4, isIPv6 } from 'is-ip';
import { NextRequest } from 'next/server';

const TRUSTED_HEADER_CANDIDATES = [
  'cf-connecting-ip',
  'true-client-ip',
  'cf-connecting-ipv6',
] as const;

function normalizeIpCandidate(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || /[\s\t\n\r]/.test(trimmed)) {
    return null;
  }

  if (isIP(trimmed)) {
    return trimmed;
  }

  const bracketMatch = trimmed.match(/^\[([^\]]+)\](?::([0-9]{1,5}))?$/);
  if (bracketMatch) {
    const address = bracketMatch[1];
    const portPart = bracketMatch[2];
    if (!address) {
      return null;
    }
    if (portPart) {
      const port = Number(portPart);
      if (Number.isNaN(port) || port > 65535) {
        return null;
      }
    }
    return isIPv6(address) ? address : null;
  }

  const ipv4PortMatch = trimmed.match(/^([^:]+):([0-9]{1,5})$/);
  if (ipv4PortMatch) {
    const address = ipv4PortMatch[1];
    const portString = ipv4PortMatch[2];
    if (!address) {
      return null;
    }
    const port = Number(portString);
    if (Number.isNaN(port) || port > 65535) {
      return null;
    }
    return isIPv4(address) ? address : null;
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
  for (const candidate of values) {
    const sanitized = normalizeIpCandidate(candidate);
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

  candidateIps.push(normalizeIpCandidate(requestWithMeta.cf?.connectingIP));

  for (const headerName of TRUSTED_HEADER_CANDIDATES) {
    candidateIps.push(extractIpFromHeader(request, headerName));
  }

  candidateIps.push(normalizeIpCandidate(requestWithMeta.ip));
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
