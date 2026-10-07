export type NotificationType =
  | 'NEW_CHAPTER'
  | 'NEW_COMMENT'
  | 'NEW_ENROLLMENT'
  | 'COURSE_INVITATION'
  | 'INVITATION_ACCEPTED';

export type NotificationInvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface NotificationItem {
    id: number;
    type: NotificationType;
    content: string;
    isRead: boolean;
    createdAt: string;
    relatedEntityType: string | null;
    relatedEntityId: number | null;
    /** Có với COURSE_INVITATION / INVITATION_ACCEPTED */
    courseId: number | null;
    /** Chỉ có với COURSE_INVITATION; null nếu lời mời đã bị thu hồi */
    invitationStatus: NotificationInvitationStatus | null;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  unreadCount: number;
}