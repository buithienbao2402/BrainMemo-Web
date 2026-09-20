import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, markAllNotificationsRead, respondInvitation } from '../api/notifications.api';

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

export function useRespondInvitation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ invitationId, accept }: { invitationId: number; accept: boolean }) =>
            respondInvitation(invitationId, accept),
        // onSettled: cả khi lỗi (đã phản hồi / bị thu hồi) vẫn refetch để UI khớp server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notificationsKeys.list });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
            queryClient.invalidateQueries({ queryKey: ['learning-dashboard'] });
        },
    });
}