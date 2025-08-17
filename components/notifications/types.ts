export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number; // ms, 0で手動削除のみ
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}
