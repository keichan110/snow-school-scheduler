'use client';

import React, { createContext, useReducer, useContext } from 'react';
import { createPortal } from 'react-dom';
import { NotificationContainer } from './NotificationContainer';
import { Notification } from './types';

interface NotificationState {
  notifications: Notification[];
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' };

const NotificationContext = createContext<{
  state: NotificationState;
  dispatch: React.Dispatch<NotificationAction>;
} | null>(null);

const notificationReducer = (
  state: NotificationState,
  action: NotificationAction
): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      // 最大5件まで、古いものから削除
      const newNotifications = [...state.notifications, action.payload];
      return {
        notifications: newNotifications.slice(-5),
      };
    case 'REMOVE_NOTIFICATION':
      return {
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };
    case 'CLEAR_ALL':
      return { notifications: [] };
    default:
      return state;
  }
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, { notifications: [] });

  return (
    <NotificationContext.Provider value={{ state, dispatch }}>
      {children}
      {typeof window !== 'undefined' && createPortal(<NotificationContainer />, document.body)}
    </NotificationContext.Provider>
  );
}

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};
