"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MIN_VISIBLE_MS = 200;
const COMPLETE_DELAY_MS = 150;
const PROGRESS_TICK_MS = 160;
const PROGRESS_INITIAL = 12;
const PROGRESS_ALMOST_COMPLETE = 90;
const PROGRESS_INCREMENT_FACTOR = 0.18;
const PROGRESS_COMPLETE = 100;
const PROGRESS_RESET = 0;

function getTime() {
  if (typeof performance !== "undefined") {
    return performance.now();
  }

  return Date.now();
}

/**
 * ヘッダープログレスインジケーター
 *
 * @remarks
 * Server Componentsへの移行により、useIsFetchingではなく
 * ページ遷移（pathname/searchParams変更）を検知してローディング表示します。
 */
export function HeaderProgressIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const previousPathnameRef = useRef<string | null>(null);
  const previousSearchParamsRef = useRef<string | null>(null);

  const shouldRender = visible;

  useEffect(
    () => () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    },
    []
  );

  // ページ遷移開始時の処理
  const startProgressTracking = useCallback(() => {
    // 既存の非表示タイマーをキャンセル
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // 初回表示時の初期化
    if (!visible) {
      startTimeRef.current = getTime();
      setVisible(true);
      setProgress(PROGRESS_INITIAL);
    }

    // プログレス更新インターバルの開始
    if (!intervalRef.current) {
      intervalRef.current = window.setInterval(() => {
        setProgress((current) => {
          if (current >= PROGRESS_ALMOST_COMPLETE) {
            return current;
          }
          const delta =
            (PROGRESS_ALMOST_COMPLETE - current) * PROGRESS_INCREMENT_FACTOR;
          return current + delta;
        });
      }, PROGRESS_TICK_MS);
    }
  }, [visible]);

  // ページ遷移終了時の処理
  const stopProgressTracking = useCallback(() => {
    // プログレス更新インターバルの停止
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 非表示状態なら早期リターン
    if (!visible) {
      return;
    }

    // 完了状態に設定
    setProgress(PROGRESS_COMPLETE);

    // 最小表示時間を考慮した遅延計算
    const elapsed = startTimeRef.current
      ? getTime() - startTimeRef.current
      : MIN_VISIBLE_MS;
    const delay =
      Math.max(MIN_VISIBLE_MS - elapsed, PROGRESS_RESET) + COMPLETE_DELAY_MS;

    // 遅延後に非表示化
    hideTimeoutRef.current = window.setTimeout(() => {
      startTimeRef.current = null;
      setVisible(false);
      setProgress(PROGRESS_RESET);
      hideTimeoutRef.current = null;
    }, delay);
  }, [visible]);

  // pathname または searchParams の変更を監視
  useEffect(() => {
    const currentPathname = pathname;
    const currentSearchParams = searchParams?.toString() ?? "";

    // 初回マウント時は記録のみ
    if (
      previousPathnameRef.current === null &&
      previousSearchParamsRef.current === null
    ) {
      previousPathnameRef.current = currentPathname;
      previousSearchParamsRef.current = currentSearchParams;
      return;
    }

    // pathname または searchParams が変更されたら遷移完了とみなす
    const hasChanged =
      previousPathnameRef.current !== currentPathname ||
      previousSearchParamsRef.current !== currentSearchParams;

    if (hasChanged) {
      // 遷移が検知された時点で進捗開始
      // （Next.jsのusePathname/useSearchParamsは遷移完了後に更新されるため、
      //  ここで開始することで少なくとも変更検知時に進捗バーが表示される）
      startProgressTracking();

      // 短い遅延後に遷移完了とする
      const completeTimeout = window.setTimeout(() => {
        stopProgressTracking();
      }, 100);

      // 前回の値を更新
      previousPathnameRef.current = currentPathname;
      previousSearchParamsRef.current = currentSearchParams;

      return () => {
        window.clearTimeout(completeTimeout);
      };
    }

    return;
  }, [pathname, searchParams, startProgressTracking, stopProgressTracking]);

  if (!shouldRender) {
    return null;
  }

  const clampedProgress = Math.max(
    PROGRESS_RESET,
    Math.min(progress, PROGRESS_COMPLETE)
  );

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden transition-opacity duration-200 ease-out",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="absolute inset-0 bg-primary/[0.03]" />
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/[0.12] via-primary/[0.08] to-transparent transition-[width] duration-300 ease-out"
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
}
