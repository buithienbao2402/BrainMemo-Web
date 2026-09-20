import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ActionIcon,
    Button,
    Center,
    Divider,
    Group,
    Indicator,
    Loader,
    Popover,
    ScrollArea,
    Stack,
    Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
    IconBell,
    IconBook2,
    IconCircleCheck,
    IconMailForward,
    IconMessageCircle,
    IconUserPlus,
} from '@tabler/icons-react';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import {
    useMarkAllNotificationsRead,
    useNotificationsList,
    useRespondInvitation,
} from '../hooks/useNotificationsList';
import type { NotificationItem, NotificationType } from '../types/notifications.types';
import { formatRelativeTime } from '@/features/courses/utils/format';
import { extractApiErrorMessage } from '@/shared/hooks/usePasscodeAccess';

const TYPE_ICON: Record<NotificationType, typeof IconBell> = {
    NEW_CHAPTER: IconBook2,
    NEW_COMMENT: IconMessageCircle,
    NEW_ENROLLMENT: IconUserPlus,
    COURSE_INVITATION: IconMailForward,
    INVITATION_ACCEPTED: IconCircleCheck,
};

function NotificationRow({
    item,
    onNavigate,
}: {
    item: NotificationItem;
    onNavigate: () => void;
}) {
    const navigate = useNavigate();
    const respond = useRespondInvitation();
    const [localStatus, setLocalStatus] = useState<'ACCEPTED' | 'DECLINED' | null>(null);

    const Icon = TYPE_ICON[item.type] ?? IconBell;
    const isInvitation =
        item.type === 'COURSE_INVITATION' &&
        item.relatedEntityType === 'course_invitation' &&
        item.relatedEntityId != null;
    const status = localStatus ?? item.invitationStatus;

    // Creator bấm vào thông báo "đã đồng ý" -> vào thẳng màn quản lý khóa học
    const isCreatorLink = item.type === 'INVITATION_ACCEPTED' && item.courseId != null;

    const goTo = (path: string) => {
        onNavigate();
        navigate(path);
    };

    const handleRespond = (accept: boolean) => {
        if (item.relatedEntityId == null) return;
        respond.mutate(
            { invitationId: item.relatedEntityId, accept },
            {
                onSuccess: (res) => setLocalStatus(res.status),
                onError: (err) =>
                    notifications.show({
                        color: 'red',
                        message: extractApiErrorMessage(err, 'Không thể phản hồi lời mời.'),
                    }),
            }
        );
    };

    const pendingAccept = respond.isPending && respond.variables?.accept === true;
    const pendingDecline = respond.isPending && respond.variables?.accept === false;

    return (
        <Group
      align= "flex-start"
    gap = "sm"
    wrap = "nowrap"
    py = { 8}
    px = { 8}
    role = { isCreatorLink? 'button': undefined }
    tabIndex = { isCreatorLink? 0: undefined }
    onClick = { isCreatorLink?() => goTo(`/creator/courses/${item.courseId }`) : undefined}
      onKeyDown={
        isCreatorLink
          ? (e) => e.key === 'Enter' && goTo(`/ creator / courses / ${ item.courseId }`)
          : undefined
      }
      style={{
        borderRadius: 8,
        cursor: isCreatorLink ? 'pointer' : undefined,
        backgroundColor: item.isRead ? undefined : 'var(--mantine-color-orange-light)',
      }}
    >
      <Icon size={18} color="var(--mantine-color-orange-6)" style={{ marginTop: 2, flexShrink: 0 }} />
      <Stack gap={4} style={{ flex: 1 }}>
        <Text size="sm">{item.content}</Text>
        <Text size="xs" c="dimmed">
          {formatRelativeTime(item.createdAt)}
        </Text>

        {isInvitation && status === 'PENDING' && (
          <Group gap="xs" mt={4}>
            <Button
              size="xs"
              loading={pendingAccept}
              disabled={respond.isPending}
              onClick={() => handleRespond(true)}
            >
              Đồng ý
            </Button>
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              loading={pendingDecline}
              disabled={respond.isPending}
              onClick={() => handleRespond(false)}
            >
              Từ chối
            </Button>
          </Group>
        )}

        {isInvitation && status === 'ACCEPTED' && (
          <Group gap="xs" mt={4}>
            <Text size="xs" c="green" fw={600}>
              Bạn đã đồng ý tham gia
            </Text>
            {item.courseId != null && (
              <Button
                size="compact-xs"
                variant="light"
                onClick={() => goTo(`/ courses / ${ item.courseId }`)}
              >
                Đi tới khóa học
              </Button>
            )}
          </Group>
        )}

        {isInvitation && status === 'DECLINED' && (
          <Text size="xs" c="dimmed" fw={600} mt={4}>
            Bạn đã từ chối
          </Text>
        )}

        {isInvitation && status === null && (
          <Text size="xs" c="dimmed" fw={600} mt={4}>
            Lời mời đã bị thu hồi
          </Text>
        )}
      </Stack>
    </Group>
  );
}

export function NotificationDropdown() {
  const [opened, setOpened] = useState(false);
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useNotificationsList();
  const markAllRead = useMarkAllNotificationsRead();

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      width={360}
      shadow="md"
      withArrow
      withinPortal // BẮT BUỘC: Đưa dropdown ra ngoài DOM body để không bị TopBar che khuất
      zIndex={1000} // BẮT BUỘC: Nổi lên trên cùng của giao diện
      trapFocus={false}
    >
      <Popover.Target>
        {/* Bọc trực tiếp sự kiện click vào ActionIcon */}
        <div style={{ display: 'inline-flex' }}>
          <Indicator color="red" size={9} offset={5} disabled={unreadCount === 0} inline>
            <ActionIcon
              variant="subtle"
              size="lg"
              radius="xl"
              onClick={() => setOpened((prev) => !prev)} // BẮT BUỘC: Kích hoạt đóng/mở state
              aria-label="Thông báo"
            >
              <IconBell size={22} color="#fff" stroke={1.5} />
            </ActionIcon>
          </Indicator>
        </div>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Group justify="space-between" p="sm">
          <Text fw={700} size="sm">
            Thông báo
          </Text>
          {unreadCount > 0 && (
            <Text
              size="xs"
              c="orange"
              style={{ cursor: 'pointer' }}
              onClick={() => markAllRead.mutate()}
            >
              Đánh dấu đã đọc tất cả
            </Text>
          )}
        </Group>
        <Divider />

        <ScrollArea.Autosize mah={400} type="auto" p="xs">
          {isLoading ? (
            <Center py="lg">
              <Loader color="orange" size="sm" />
            </Center>
          ) : items.length === 0 ? (
            <Center py="lg">
              <Text size="sm" c="dimmed">
                Chưa có thông báo nào.
              </Text>
            </Center>
          ) : (
            <Stack gap={4}>
              {items.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  onNavigate={() => setOpened(false)}
                />
              ))}
            </Stack>
          )}

          {hasNextPage && (
            <Center py="sm">
              <Button
                variant="subtle"
                size="xs"
                color="orange"
                loading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                Xem thêm
              </Button>
            </Center>
          )}
        </ScrollArea.Autosize>
      </Popover.Dropdown>
    </Popover>
  );
}