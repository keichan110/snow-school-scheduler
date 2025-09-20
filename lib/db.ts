import { PrismaClient } from '@prisma/client';

// Cloudflare Workers環境でのPrismaクライアント設定
// OpenNext CloudflareがD1バインディングとの連携を自動で処理
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
