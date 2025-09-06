'use client';

import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { ProtectedLayout } from '@/components/auth/ProtectedRoute';

/**
 * 管理者レイアウト
 * 管理機能権限（MANAGER以上）が必要なすべてのページを保護
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedLayout layoutName="Admin" requiredRole="MANAGER" fallback={<AdminAccessDenied />}>
      <div className="min-h-screen pt-20">{children}</div>
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
