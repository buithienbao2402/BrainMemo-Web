import { apiClient } from '@/shared/lib/axios'; // ⚠️ đổi tên export nếu file thật của bạn khác
import type { ApiResponse } from '@/shared/types/api.types';

interface UnreadCountResponse {
  unreadCount: number;
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const { data } = await apiClient.get<ApiResponse<UnreadCountResponse>>(
    '/notifications/unread-count'
  );
  return data.data.unreadCount;
}