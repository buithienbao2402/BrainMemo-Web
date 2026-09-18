import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { NotificationListResponse } from '../types/notifications.types';

interface UnreadCountResponse {
  unreadCount: number;
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const { data } = await apiClient.get<ApiResponse<UnreadCountResponse>>(
    '/notifications/unread-count'
  );
  return data.data.unreadCount;
}

export async function fetchNotifications(page: number, pageSize = 10): Promise<NotificationListResponse> {
  const { data } = await apiClient.get<ApiResponse<NotificationListResponse>>('/notifications', {
    params: { page, pageSize },
  });
  return data.data;
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch('/notifications/read-all', {});
}