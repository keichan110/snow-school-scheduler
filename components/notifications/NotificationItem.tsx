'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNotification } from './useNotification';
import { useNotificationContext } from './NotificationProvider';
import { Notification } from './types';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success:
    'border-green-200 bg-green-50 text-green-900 dark:border-green-700 dark:bg-green-950 dark:text-green-100',
  error:
    'border-red-200 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-100',
  warning:
    'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-100',
  info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-100',
};

const ICON_COLORS = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
};

const PRIORITY_STYLES = {
  urgent: 'ring-2 ring-red-500 ring-opacity-50',
  high: 'ring-1 ring-orange-400 ring-opacity-30',
  normal: '',
  low: 'opacity-90',
};

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { hideNotification } = useNotification();
  const { state } = useNotificationContext();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();

  // 安定した参照を作成してuseEffect依存配列問題を回避
  const hideNotificationRef = useRef(hideNotification);
  const notificationIdRef = useRef(notification.id);
  const isPausedRef = useRef(isPaused);
  const isExitingRef = useRef(isExiting);

  // refs を最新の値で更新
  hideNotificationRef.current = hideNotification;
  notificationIdRef.current = notification.id;
  isPausedRef.current = isPaused;
  isExitingRef.current = isExiting;

  const Icon = ICONS[notification.type];

  // 共通の削除ロジック - useCallbackで安定化し、refを使用して依存配列を空にする
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setTimeout(() => {
      hideNotificationRef.current(notificationIdRef.current);
    }, 200); // アニメーション時間と合わせる
  }, []);

  // 統合されたタイマー管理 - マウント時にのみ実行
  useEffect(() => {
    if (!notification.duration || notification.duration <= 0 || notification.persistent) {
      return;
    }

    const startTime = Date.now();
    startTimeRef.current = startTime;
    let pausedAt = 0;
    let totalPausedTime = 0;

    const updateProgress = () => {
      if (isPausedRef.current) {
        if (pausedAt === 0) {
          pausedAt = Date.now();
        }
        return; // 一時停止中は何もしない
      }

      if (pausedAt > 0) {
        totalPausedTime += Date.now() - pausedAt;
        pausedAt = 0;
      }

      if (!isExitingRef.current) {
        const elapsed = Date.now() - startTime - totalPausedTime;
        const progressPercent = Math.min((elapsed / notification.duration!) * 100, 100);
        setProgress(progressPercent);

        if (progressPercent >= 100) {
          setIsExiting(true);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          setTimeout(() => {
            hideNotificationRef.current(notificationIdRef.current);
          }, 200);
        }
      }
    };

    const intervalId = setInterval(updateProgress, 50);
    progressIntervalRef.current = intervalId;

    // クリーンアップ関数
    return () => {
      // intervalIdは確実にクリアできるが、timeoutRefは手動削除で既にクリアされている可能性がある
      if (intervalId) clearInterval(intervalId);
      // timeoutRefのクリアは handleDismiss で行われるため、ここでは行わない
    };
  }, [notification.duration, notification.persistent]); // state依存を除外し、refで状態を参照

  // 一時停止状態の監視のみ - タイマーリセットは行わない
  useEffect(() => {
    // このeffectは状態監視のみで、タイマー操作は行わない
    // 実際の一時停止ロジックは上記のuseEffectのupdateProgress内で処理
  }, [isPaused, state.config.pauseOnHover]);

  useEffect(() => {
    // アニメーション用の遅延 - 初回のみ実行
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseEnter = () => {
    if (state.config.pauseOnHover) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (state.config.pauseOnHover) {
      setIsPaused(false);
    }
  };

  return (
    <div
      className={cn(
        'pointer-events-auto relative transform rounded-lg border shadow-lg transition-all duration-300 ease-in-out',
        'hover:scale-[1.02] hover:shadow-xl',
        STYLES[notification.type],
        PRIORITY_STYLES[notification.priority || 'normal'],
        isVisible && !isExiting
          ? 'translate-x-0 scale-100 opacity-100'
          : 'translate-x-full scale-95 opacity-0',
        isPaused && 'ring-2 ring-blue-400 ring-opacity-30'
      )}
      role="alert"
      aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* プログレスバー */}
      {notification.duration && notification.duration > 0 && !notification.persistent && (
        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-lg bg-black/10 dark:bg-white/10">
          <div
            className={cn(
              'h-full transition-all duration-100 ease-linear',
              notification.type === 'success' && 'bg-green-500',
              notification.type === 'error' && 'bg-red-500',
              notification.type === 'warning' && 'bg-yellow-500',
              notification.type === 'info' && 'bg-blue-500'
            )}
            style={{ width: `${100 - progress}%` }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <Icon
            className={cn(
              'mt-0.5 h-5 w-5 flex-shrink-0 transition-transform duration-200',
              ICON_COLORS[notification.type],
              notification.priority === 'urgent' && 'animate-pulse'
            )}
          />

          <div className="min-w-0 flex-1">
            {notification.title && (
              <h4 className="mb-1 text-sm font-semibold">{notification.title}</h4>
            )}
            <p className="text-sm">{notification.message}</p>

            {/* 単一アクション */}
            {notification.action && !notification.actions && (
              <div className="mt-3">
                <Button
                  variant={notification.action.variant || 'outline'}
                  size="sm"
                  onClick={notification.action.onClick}
                  disabled={notification.action.loading}
                  className="h-7 px-2 text-xs transition-transform duration-150 hover:scale-105"
                >
                  {notification.action.loading ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    notification.action.label
                  )}
                </Button>
              </div>
            )}

            {/* 複数アクション */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {notification.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || (action.primary ? 'default' : 'outline')}
                    size="sm"
                    onClick={action.onClick}
                    disabled={action.loading}
                    className={cn(
                      'h-7 px-2 text-xs transition-transform duration-150 hover:scale-105',
                      action.primary && 'font-semibold'
                    )}
                  >
                    {action.loading ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      action.label
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {notification.dismissible && (
            <button
              onClick={handleDismiss}
              className={cn(
                'flex-shrink-0 rounded-full p-1 transition-all duration-150',
                'hover:scale-110 hover:bg-black/10 dark:hover:bg-white/10',
                'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1'
              )}
              aria-label="通知を閉じる"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 優先度インジケーター */}
      {notification.priority && notification.priority !== 'normal' && (
        <div
          className={cn(
            'absolute right-2 top-2 h-2 w-2 rounded-full',
            notification.priority === 'urgent' && 'animate-ping bg-red-500',
            notification.priority === 'high' && 'bg-orange-500',
            notification.priority === 'low' && 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
}
