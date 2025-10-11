"use client";

import { useIsFetching } from "@tanstack/react-query";
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

export function HeaderProgressIndicator() {
  const isFetching = useIsFetching();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  const shouldRender = visible || isFetching > 0;

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

  // Fetching開始時の処理
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

  // Fetching終了時の処理
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

  useEffect(() => {
    if (isFetching > 0) {
      startProgressTracking();
      return;
    }
    stopProgressTracking();
  }, [isFetching, startProgressTracking, stopProgressTracking]);

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
