'use client';

import React from 'react';
import { useNotificationContext } from './NotificationProvider';
import { NotificationItem } from './NotificationItem';

export function NotificationContainer() {
  const { state } = useNotificationContext();

  if (state.notifications.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] flex items-start justify-end p-4">
      <div className="flex max-w-sm flex-col space-y-3">
        {state.notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
}
