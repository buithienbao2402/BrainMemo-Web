import { useQuery } from '@tanstack/react-query';
import { fetchUnreadNotificationCount } from '../api/notifications.api';
import { useAuthStore } from '@/features/auth/store/authStore';

export function useUnreadNotificationsCount() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery<number>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadNotificationCount,
    enabled: !!accessToken,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}