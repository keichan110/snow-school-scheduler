'use client';

import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { ProtectedLayout } from '@/components/auth/ProtectedRoute';
import { Shield } from '@phosphor-icons/react';

/**
 * 管理者レイアウト
 * 管理機能権限（MANAGER以上）が必要なすべてのページを保護
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedLayout layoutName="Admin" requiredRole="MANAGER" fallback={<AdminAccessDenied />}>
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
 * 管理権限がない場合の処理
 * 404ページを表示する
 */
function AdminAccessDenied(): never {
  notFound();
}
