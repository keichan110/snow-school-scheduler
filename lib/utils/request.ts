import { NextRequest } from 'next/server';

const TRUSTED_HEADER_CANDIDATES = [
  'cf-connecting-ip',
  'true-client-ip',
  'cf-connecting-ipv6',
] as const;

function isValidPort(value: string | undefined | null): boolean {
  if (!value) {
    return true;
  }
  if (!/^\d{1,5}$/.test(value)) {
    return false;
  }
  const port = Number(value);
  return port <= 65535;
}

function isValidIPv4(address: string): boolean {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(address)) {
    return false;
  }

  const segments = address.split('.');
  return segments.every((segment) => {
    const numeric = Number(segment);
    return numeric >= 0 && numeric <= 255;
  });
}

function isValidIPv6(address: string): boolean {
  if (address.length === 0 || address.length > 45) {
    return false;
  }

  if (!/^[0-9A-Fa-f:.]+$/.test(address)) {
    return false;
  }

  let normalized = address;
  const hasEmbeddedIPv4 = address.includes('.');

  if (hasEmbeddedIPv4) {
    const lastColon = address.lastIndexOf(':');
    if (lastColon === -1) {
      return false;
    }

    const ipv4Part = address.slice(lastColon + 1);
    if (!isValidIPv4(ipv4Part)) {
      return false;
    }

    const octets = ipv4Part.split('.').map(Number);
    if (octets.length !== 4) {
      return false;
    }
    const toHextet = (value: number) => value.toString(16).padStart(4, '0');
    const high = ((octets[0] ?? 0) << 8) | (octets[1] ?? 0);
    const low = ((octets[2] ?? 0) << 8) | (octets[3] ?? 0);

    normalized = `${address.slice(0, lastColon)}:${toHextet(high)}:${toHextet(low)}`;
  }

  const sections = normalized.split('::');
  if (sections.length > 2) {
    return false;
  }

  const splitHextets = (part: string) =>
    (part.length > 0 ? part.split(':') : []).filter((segment) => segment.length > 0);

  const leftSections = splitHextets(sections[0] ?? '');
  const rightSections = sections.length === 2 ? splitHextets(sections[1] ?? '') : [];

  const isValidHextet = (value: string) => /^[0-9A-Fa-f]{1,4}$/.test(value);

  if (leftSections.some((segment) => !isValidHextet(segment))) {
    return false;
  }

  if (rightSections.some((segment) => !isValidHextet(segment))) {
    return false;
  }

  const hextetCount = leftSections.length + rightSections.length;
  const hasCompression = normalized.includes('::');

  if (hasCompression) {
    if (hextetCount >= 8) {
      return false;
    }
  } else if (hextetCount !== 8) {
    return false;
  }

  return true;
}

function normalizeIpCandidate(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || /[\s\t\n\r]/.test(trimmed)) {
    return null;
  }

  const bracketMatch = trimmed.match(/^\[([^\]]+)\](?::([0-9]{1,5}))?$/);
  if (bracketMatch) {
    const address = bracketMatch[1];
    if (!address) {
      return null;
    }
    const portPart = bracketMatch[2] ?? null;
    if (!isValidPort(portPart)) {
      return null;
    }
    return isValidIPv6(address) ? address : null;
  }

  const ipv4Match = trimmed.match(/^([0-9.]+)(?::([0-9]{1,5}))?$/);
  if (ipv4Match) {
    const address = ipv4Match[1];
    if (!address) {
      return null;
    }
    const portPart = ipv4Match[2] ?? null;
    if (!isValidPort(portPart)) {
      return null;
    }
    return isValidIPv4(address) ? address : null;
  }

  return isValidIPv6(trimmed) ? trimmed : null;
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

function extractOrigin(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch (error) {
    return null;
  }
}

function buildAllowedReferrerOrigins(env: string | undefined): Set<string> {
  const allowedOrigins = new Set<string>();

  const addOrigin = (candidate: string | null) => {
    if (!candidate) {
      return;
    }
    allowedOrigins.add(candidate);
  };

  const nextAuthOrigin = extractOrigin(process.env.NEXTAUTH_URL);
  const nextPublicAppOrigin = extractOrigin(process.env.NEXT_PUBLIC_APP_URL);

  addOrigin(nextAuthOrigin);

  if (env !== 'production') {
    addOrigin(nextPublicAppOrigin);
    addOrigin('http://localhost:3000');
    addOrigin('http://127.0.0.1:3000');
  }

  return allowedOrigins;
}

export function isAllowedReferrer(request: NextRequest): boolean {
  const refererHeader = request.headers.get('referer');
  const env = process.env.NODE_ENV;

  if (!refererHeader) {
    return env !== 'production';
  }

  const refererOrigin = extractOrigin(refererHeader);
  if (!refererOrigin) {
    return false;
  }

  const allowedOrigins = buildAllowedReferrerOrigins(env);
  if (allowedOrigins.size === 0) {
    return env !== 'production';
  }

  return allowedOrigins.has(refererOrigin);
}
