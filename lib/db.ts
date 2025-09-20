import { PrismaClient } from '@prisma/client';

// Cloudflare Workers環境でのPrismaクライアント設定
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Cloudflare Workers環境での設定
function createPrismaClient(): PrismaClient {
  // Cloudflare Workers環境では、D1バインディングを使用
  // OpenNext CloudflareがD1との連携を自動で処理するため、
  // 標準的なPrismaクライアントを使用
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
