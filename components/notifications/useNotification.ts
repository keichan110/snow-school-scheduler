import { useCallback } from 'react';
import { useNotificationContext } from './NotificationProvider';
import { Notification, NotificationType } from './types';

const DEFAULT_DURATIONS: Record<NotificationType, number> = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000,
};

export function useNotification() {
  const { dispatch } = useNotificationContext();

  const showNotification = useCallback(
    (
      message: string,
      type: NotificationType,
      options?: {
        title?: string;
        duration?: number;
        dismissible?: boolean;
        action?: { label: string; onClick: () => void };
      }
    ) => {
      const id = `notification-${Date.now()}-${Math.random()}`;
      const duration = options?.duration ?? DEFAULT_DURATIONS[type];

      const notification: Notification = {
        id,
        type,
        message,
        duration,
        dismissible: options?.dismissible ?? true,
        ...(options?.title && { title: options.title }),
        ...(options?.action && { action: options.action }),
      };

      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

      // 自動削除（duration > 0の場合）
      if (duration > 0) {
        setTimeout(() => {
          dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
        }, duration);
      }

      return id;
    },
    [dispatch]
  );

  const hideNotification = useCallback(
    (id: string) => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    },
    [dispatch]
  );

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, [dispatch]);

  return {
    showNotification,
    hideNotification,
    clearAll,
  };
}
