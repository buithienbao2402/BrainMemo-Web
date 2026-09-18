export type NotificationType =
  | 'NEW_CHAPTER'
  | 'NEW_COMMENT'
  | 'NEW_ENROLLMENT'
  | 'COURSE_INVITATION'
  | 'INVITATION_ACCEPTED';

export interface NotificationItem {
  id: number;
  type: NotificationType;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  unreadCount: number;
}