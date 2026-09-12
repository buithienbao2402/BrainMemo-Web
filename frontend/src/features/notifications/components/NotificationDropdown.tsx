import { ActionIcon, Button, Center, Divider, Group, Indicator, Loader, Popover, ScrollArea, Stack, Text } from '@mantine/core';
import { IconBell, IconBook2, IconCircleCheck, IconMailForward, IconMessageCircle, IconUserPlus } from '@tabler/icons-react';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import { useMarkAllNotificationsRead, useNotificationsList } from '../hooks/useNotificationsList';
import type { NotificationItem, NotificationType } from '../types/notifications.types';
import { formatRelativeTime } from '@/features/courses/utils/format';

const TYPE_ICON: Record<NotificationType, typeof IconBell> = {
  NEW_CHAPTER: IconBook2,
  NEW_COMMENT: IconMessageCircle,
  NEW_ENROLLMENT: IconUserPlus,
  COURSE_INVITATION: IconMailForward,
  INVITATION_ACCEPTED: IconCircleCheck,
};

function NotificationRow({ item }: { item: NotificationItem }) {
  const Icon = TYPE_ICON[item.type] ?? IconBell;
  return (
    <Group
      align="flex-start"
      gap="sm"
      wrap="nowrap"
      py={8}
      px={8}
      style={{
        borderRadius: 8,
        backgroundColor: item.isRead ? undefined : 'var(--mantine-color-orange-light)',
      }}
    >
      <Icon size={18} color="var(--mantine-color-orange-6)" style={{ marginTop: 2, flexShrink: 0 }} />
      <Stack gap={2} style={{ flex: 1 }}>
        <Text size="sm">{item.content}</Text>
        <Text size="xs" c="dimmed">{formatRelativeTime(item.createdAt)}</Text>
      </Stack>
    </Group>
  );
}

export function NotificationDropdown() {
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useNotificationsList();
  const markAllRead = useMarkAllNotificationsRead();

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <Popover position="bottom-end" width={360} shadow="md" withArrow>
      <Popover.Target>
        <Indicator color="red" size={9} offset={5} disabled={unreadCount === 0}>
          <ActionIcon variant="subtle" size="lg" radius="xl">
            <IconBell size={22} color="#fff" stroke={1.5} />
          </ActionIcon>
        </Indicator>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Group justify="space-between" p="sm">
          <Text fw={700} size="sm">Thông báo</Text>
          {unreadCount > 0 && (
            <Text size="xs" c="orange" style={{ cursor: 'pointer' }} onClick={() => markAllRead.mutate()}>
              Đánh dấu đã đọc tất cả
            </Text>
          )}
        </Group>
        <Divider />

        <ScrollArea.Autosize mah={400} type="auto" p="xs">
          {isLoading ? (
            <Center py="lg"><Loader color="orange" size="sm" /></Center>
          ) : items.length === 0 ? (
            <Center py="lg"><Text size="sm" c="dimmed">Chưa có thông báo nào.</Text></Center>
          ) : (
            <Stack gap={4}>
              {items.map((item) => <NotificationRow key={item.id} item={item} />)}
            </Stack>
          )}

          {hasNextPage && (
            <Center py="sm">
              <Button variant="subtle" size="xs" color="orange" loading={isFetchingNextPage} onClick={() => fetchNextPage()}>
                Xem thêm
              </Button>
            </Center>
          )}
        </ScrollArea.Autosize>
      </Popover.Dropdown>
    </Popover>
  );
}