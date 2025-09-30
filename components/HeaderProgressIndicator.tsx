"use client";

import { useIsFetching } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MIN_VISIBLE_MS = 200;
const COMPLETE_DELAY_MS = 150;
const PROGRESS_TICK_MS = 160;

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

  useEffect(() => {
    if (isFetching > 0) {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      if (!visible) {
        startTimeRef.current = getTime();
        setVisible(true);
        setProgress(12);
      }

      if (!intervalRef.current) {
        intervalRef.current = window.setInterval(() => {
          setProgress((current) => {
            if (current >= 90) return current;
            const delta = (90 - current) * 0.18;
            return current + delta;
          });
        }, PROGRESS_TICK_MS);
      }

      return;
    }

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!visible) return;

    setProgress(100);

    const elapsed = startTimeRef.current
      ? getTime() - startTimeRef.current
      : MIN_VISIBLE_MS;
    const delay = Math.max(MIN_VISIBLE_MS - elapsed, 0) + COMPLETE_DELAY_MS;

    hideTimeoutRef.current = window.setTimeout(() => {
      startTimeRef.current = null;
      setVisible(false);
      setProgress(0);
      hideTimeoutRef.current = null;
    }, delay);
  }, [isFetching, visible]);

  if (!shouldRender) return null;

  const clampedProgress = Math.max(0, Math.min(progress, 100));

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
