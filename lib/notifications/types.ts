/**
 * Notifications type definitions
 * TypeScript interfaces for notifications
 */

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  created_at: string;
  read_at: string | null;
}

export interface NotificationWithStatus extends Notification {
  is_read: boolean;
}
