import { z } from 'zod';

/**
 * 環境変数のバリデーションスキーマ定義
 */
const envSchema = z.object({
  // 基本設定
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // データベース設定
  // Cloudflare Workers + D1環境ではDATABASE_URLは不要（D1バインディングを使用）
  DATABASE_URL: z.string().min(1, '⚠️ DATABASE_URL is required').optional(),

  // 認証関連設定
  JWT_SECRET: z
    .string()
    .min(32, '⚠️ JWT_SECRET must be at least 32 characters for security')
    .refine(
      (val) => Buffer.from(val, 'utf8').length >= 32,
      '⚠️ JWT_SECRET must be at least 32 bytes when encoded as UTF-8'
    ),

  // LINE認証設定
  LINE_CHANNEL_ID: z
    .string()
    .min(1, '⚠️ LINE_CHANNEL_ID is required')
    .regex(/^\d+$/, '⚠️ LINE_CHANNEL_ID must be numeric'),

  LINE_CHANNEL_SECRET: z
    .string()
    .min(32, '⚠️ LINE_CHANNEL_SECRET must be at least 32 characters')
    .regex(/^[a-f0-9]{32}$/, '⚠️ LINE_CHANNEL_SECRET must be 32 character hex string'),

  // Next.js認証設定
  NEXTAUTH_URL: z
    .string()
    .url('⚠️ NEXTAUTH_URL must be a valid URL')
    .default('http://localhost:3000'),

  // オプション設定（デフォルト値付き）
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+[hdm]$/, '⚠️ JWT_EXPIRES_IN must be in format like "48h", "7d", "30m"')
    .default('48h'),

  INVITE_DEFAULT_EXPIRES: z
    .string()
    .regex(/^\d+[hdm]$/, '⚠️ INVITE_DEFAULT_EXPIRES must be in format like "168h", "7d"')
    .default('168h'),
});

/**
 * 環境変数の型定義
 */
export type Environment = z.infer<typeof envSchema>;

/**
 * 環境変数を検証し、型安全な形で提供
 *
 * @throws {ZodError} 環境変数が不正な場合
 */
function createEnv(): Environment {
  try {
    // Cloudflare Workers環境でDATABASE_URLが未設定の場合はダミー値を設定
    const processEnv = { ...process.env };
    if (!processEnv.DATABASE_URL && processEnv.NODE_ENV === 'production') {
      processEnv.DATABASE_URL = 'file:./db.sqlite'; // D1バインディング用ダミー（CIではPRISMA_DUMMY_DATABASE_URLを使用）
    }

    const parsed = envSchema.parse(processEnv);

    // 開発環境での警告表示
    if (parsed.NODE_ENV === 'development') {
      const warnings: string[] = [];

      if (parsed.JWT_SECRET.length < 64) {
        warnings.push('JWT_SECRET is shorter than recommended 64 characters');
      }

      if (parsed.NEXTAUTH_URL.includes('localhost')) {
        warnings.push('Using localhost URL - ensure NEXTAUTH_URL is set for production');
      }

      if (warnings.length > 0) {
        console.warn('🚨 Environment Configuration Warnings:');
        warnings.forEach((warning) => console.warn(`   • ${warning}`));
        console.warn('');
      }
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.issues.forEach((err) => {
        console.error(`   • ${err.path.join('.')}: ${err.message}`);
      });
      console.error('');
      console.error(
        '💡 Please check your .env.local file and ensure all required environment variables are set.'
      );
    }

    throw error;
  }
}

/**
 * 検証済み環境変数
 * アプリケーション全体で使用する型安全な環境変数
 */
export const env = createEnv();

/**
 * 本番環境チェック
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * 開発環境チェック
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * テスト環境チェック
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * JWT設定のヘルパー
 */
export const jwtConfig = {
  secret: env.JWT_SECRET,
  expiresIn: env.JWT_EXPIRES_IN,
} as const;

/**
 * LINE認証設定のヘルパー
 */
export const lineAuthConfig = {
  channelId: env.LINE_CHANNEL_ID,
  channelSecret: env.LINE_CHANNEL_SECRET,
  callbackUrl: `${env.NEXTAUTH_URL}/api/auth/line/callback`,
} as const;

/**
 * 招待システム設定のヘルパー
 */
export const invitationConfig = {
  defaultExpiresIn: env.INVITE_DEFAULT_EXPIRES,
  maxExpiresIn: '720h', // 30日
} as const;
