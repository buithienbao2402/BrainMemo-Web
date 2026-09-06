import { useQuery } from '@tanstack/react-query';
import { fetchUnreadNotificationCount } from '../api/notifications.api';
import { useAuthStore } from '@/features/auth/store/authStore';

export function useUnreadNotificationsCount() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadNotificationCount,
    enabled: !!accessToken,      // chỉ gọi khi đã đăng nhập
    refetchInterval: 30_000,     // polling định kỳ — đúng như contract mô tả (không realtime)
    staleTime: 15_000,
  });
}