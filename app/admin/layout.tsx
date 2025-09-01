'use client';

import { ReactNode } from 'react';
import { ProtectedLayout } from '@/components/auth/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield, Warning, House } from '@phosphor-icons/react';

/**
 * 管理者レイアウト
 * 管理者権限が必要なすべてのページを保護
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedLayout layoutName="Admin" requiredRole="ADMIN" fallback={<AdminAccessDenied />}>
      <div className="min-h-screen pt-20">
        <div className="space-y-6 p-4 lg:p-8">
          <div className="rounded-lg bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">管理者エリア</span>
            </div>
          </div>
          {children}
        </div>
      </div>
    </ProtectedLayout>
  );
}

/**
 * 管理者権限がない場合の表示コンポーネント
 */
function AdminAccessDenied() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            <Warning className="h-16 w-16 text-orange-500" />
          </div>
          <h2 className="mb-3 text-xl font-semibold">アクセス権限がありません</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            このページにアクセスするには管理者権限が必要です。
            <br />
            管理者アカウントでログインしてください。
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="outline">
              <Link href="/">
                <House className="mr-2 h-4 w-4" />
                ホームへ戻る
              </Link>
            </Button>
            <Button asChild>
              <Link href="/login">
                <Shield className="mr-2 h-4 w-4" />
                管理者でログイン
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
