import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, markAllNotificationsRead } from '../api/notifications.api';

export const notificationsKeys = {
  list: ['notifications', 'list'] as const,
};

export function useNotificationsList(pageSize = 10) {
  return useInfiniteQuery({
    queryKey: notificationsKeys.list,
    queryFn: ({ pageParam = 1 }) => fetchNotifications(pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.list });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}