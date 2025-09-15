'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { LineLoginButton } from '@/components/ui/line-login-button';
import { Snowflake } from '@phosphor-icons/react';
import { Suspense } from 'react';

/**
 * ログインページのメインコンテンツ
 */
function LoginPageContent() {
  const { user, status } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirectUrl, setRedirectUrl] = useState<string>('/');

  // リダイレクト先URLを取得
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      setRedirectUrl(redirect);
      console.log('🔄 Redirect URL detected:', redirect);
    }
  }, [searchParams]);

  // 既にログイン済みの場合はリダイレクト
  useEffect(() => {
    if (user && status === 'authenticated') {
      console.log('✅ User already authenticated, redirecting to:', redirectUrl);
      router.push(redirectUrl);
    }
  }, [user, status, redirectUrl, router]);

  const handleLineLogin = () => {
    console.log('🔐 Starting LINE authentication...');
    // リダイレクト先をURLパラメータとして渡す
    const loginUrl = `/api/auth/line/login?redirect=${encodeURIComponent(redirectUrl)}`;
    window.location.href = loginUrl;
  };

  // Helper function to generate dummy shift patterns for each day
  const generateDummyShiftPattern = (dayIndex: number) => {
    const colors = ['bg-ski-200 dark:bg-ski-800', 'bg-snowboard-200 dark:bg-snowboard-800'];

    // Vary number of shifts based on day (0-4 shifts)
    const shiftCount = (dayIndex + 1) % 5; // Some days 0, some 1-4

    return Array.from({ length: shiftCount }, (_, i) => ({
      width: 'w-full',
      color: colors[i % 2] as string,
    }));
  };

  // Helper function to render a single day card
  const renderDummyDay = (dayNumber: number, shifts: Array<{ width: string; color: string }>) => {
    // Handle next month preview days (32-35 -> 1-4)
    const displayNumber = dayNumber > 31 ? dayNumber - 31 : dayNumber;
    const isNextMonth = dayNumber > 31;

    return (
      <div
        key={dayNumber}
        className={`day-card rounded-xl border-2 ${isNextMonth ? 'border-border/50 bg-gray-100/50' : 'border-border bg-background'} p-2 shadow-sm`}
      >
        <div
          className={`mb-1 text-xs font-medium ${isNextMonth ? 'text-gray-400' : 'text-muted-foreground'}`}
        >
          {displayNumber}
        </div>
        {!isNextMonth && (
          <div className="space-y-0.5">
            {shifts.map((shift, i) => (
              <div key={i} className={`h-5 rounded ${shift.width} ${shift.color}`}></div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ローディング中はapp/page.tsxと同じ表示
  if (status === 'loading') {
    return (
      <div className="relative flex h-[calc(100vh-16rem)] items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/10 text-card-foreground shadow-lg backdrop-blur-sm">
        <div className="absolute inset-0 opacity-75">
          <div className="grid h-full w-full grid-cols-7 gap-1 p-3 blur-md">
            {Array.from({ length: 35 }, (_, i) =>
              renderDummyDay(i + 1, generateDummyShiftPattern(i))
            )}
          </div>
        </div>
        <div className="relative z-10 space-y-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-slate-400"></div>
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-16rem)] items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/10 text-card-foreground shadow-lg backdrop-blur-sm">
      {/* Background Calendar Grid - Realistic Shift Schedule */}
      <div className="absolute inset-0 opacity-75">
        <div className="grid h-full w-full grid-cols-7 gap-1 p-3 blur-md">
          {Array.from({ length: 35 }, (_, i) =>
            renderDummyDay(i + 1, generateDummyShiftPattern(i))
          )}
        </div>
      </div>
      <div className="relative z-10 space-y-8 text-center">
        {/* Exclusive Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-1.5 shadow-sm">
          <Snowflake className="h-3.5 w-3.5 text-amber-600" weight="fill" />
          <span className="text-xs font-medium tracking-wide text-amber-800">EXCLUSIVE ACCESS</span>
        </div>

        {/* Main Title */}
        <div className="relative">
          <h1 className="text-5xl font-thin tracking-[0.15em] text-slate-800 md:text-6xl lg:text-7xl">
            Members only
          </h1>
          <div className="absolute -bottom-1 left-1/2 h-[1px] w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
        </div>

        {/* Subtitle with Lock Icon */}
        <div className="flex items-center justify-center gap-2.5">
          <Snowflake className="h-5 w-4 text-slate-400" />
          <p className="text-base font-light tracking-wide text-slate-600">
            招待を受けた方のみ利用可能です
          </p>
        </div>

        {/* LINE Login Button - 追加された唯一の新要素 */}
        <div className="flex justify-center">
          <LineLoginButton onClick={handleLineLogin} size="lg" text="LINEでログイン" />
        </div>

        {/* Subtle decoration */}
        <div className="flex justify-center space-x-1.5">
          <div className="h-0.5 w-0.5 rounded-full bg-slate-300"></div>
          <div className="h-0.5 w-4 rounded-full bg-slate-200"></div>
          <div className="h-0.5 w-0.5 rounded-full bg-slate-300"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * ログインページ
 *
 * このページの目的：
 * 1. 保護されたページからのリダイレクト先として機能
 * 2. ログイン完了後に元のページに戻る
 * 3. シンプルで明確なログインフロー提供
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}