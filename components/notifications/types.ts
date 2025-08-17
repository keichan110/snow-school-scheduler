export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number; // ms, 0で手動削除のみ
  dismissible?: boolean;
  priority?: NotificationPriority;
  persistent?: boolean; // true の場合、自動削除されない
  timestamp?: number; // 作成タイムスタンプ
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    loading?: boolean;
  };
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    loading?: boolean;
    primary?: boolean;
  }>;
}

export interface NotificationQueueConfig {
  maxNotifications: number;
  pauseOnHover: boolean;
  preventDuplicates: boolean;
  duplicateTimeWindow: number; // ms
}
