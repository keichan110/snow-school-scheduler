'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

/**
 * グローバル404ページ
 * Next.jsの標準的なnot-found.tsxファイル
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* 404アイコンとメッセージ */}
        <div className="mb-8">
          <div className="mb-4 text-8xl font-bold text-primary">404</div>
          <h1 className="mb-3 text-2xl font-semibold text-foreground">ページが見つかりません</h1>
          <p className="text-muted-foreground">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
        </div>

        {/* ナビゲーションボタン */}
        <div className="space-y-3">
          <Button asChild variant="outline" className="w-full" size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              ホームに戻る
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
