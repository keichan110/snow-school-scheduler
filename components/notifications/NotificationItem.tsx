'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNotification } from './useNotification';
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

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { hideNotification } = useNotification();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const Icon = ICONS[notification.type];

  useEffect(() => {
    // アニメーション用の遅延
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      hideNotification(notification.id);
    }, 200); // アニメーション時間と合わせる
  };

  return (
    <div
      className={cn(
        'pointer-events-auto relative transform rounded-lg border p-4 shadow-lg transition-all duration-200 ease-in-out',
        STYLES[notification.type],
        isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', ICON_COLORS[notification.type])} />

        <div className="min-w-0 flex-1">
          {notification.title && (
            <h4 className="mb-1 text-sm font-semibold">{notification.title}</h4>
          )}
          <p className="text-sm">{notification.message}</p>

          {notification.action && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={notification.action.onClick}
                className="h-7 px-2 text-xs"
              >
                {notification.action.label}
              </Button>
            </div>
          )}
        </div>

        {notification.dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="通知を閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
