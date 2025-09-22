'use client';

import { useEffect, useRef, useState } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const MIN_VISIBLE_MS = 200;
const COMPLETE_DELAY_MS = 150;
const PROGRESS_TICK_MS = 160;

function getTime() {
  if (typeof performance !== 'undefined') {
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

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, []);

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

    const elapsed = startTimeRef.current ? getTime() - startTimeRef.current : MIN_VISIBLE_MS;
    const delay = Math.max(MIN_VISIBLE_MS - elapsed, 0) + COMPLETE_DELAY_MS;

    hideTimeoutRef.current = window.setTimeout(() => {
      startTimeRef.current = null;
      setVisible(false);
      setProgress(0);
      hideTimeoutRef.current = null;
    }, delay);
  }, [isFetching, visible]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 transition-opacity duration-200',
        visible ? 'opacity-100' : 'opacity-0'
      )}
      aria-hidden
    >
      <Progress
        value={Math.max(0, Math.min(progress, 100))}
        className="h-0.5 w-full rounded-none border-0 bg-primary/10 sm:h-1"
      />
    </div>
  );
}
