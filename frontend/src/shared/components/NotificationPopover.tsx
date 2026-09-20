import { useState, useEffect } from 'react';
import {
    Popover,
    ActionIcon,
    Indicator,
    Stack,
    Group,
    Text,
    Button,
    ScrollArea,
    Divider,
    Loader,
    Center,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBell, IconCheck, IconX, IconInbox } from '@tabler/icons-react';
import { apiClient } from '@/shared/lib/axios';
import { respondToInvitation } from '@/features/course-management/api/invitations.api';

interface NotificationItem {
    notificationId: number;
    type: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    relatedEntityId?: number;
}

export function NotificationPopover() {
    const [opened, setOpened] = useState(false);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    // Tải danh sách thông báo từ Backend
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/notifications');
            if (res.data?.success && res.data?.data) {
                setItems(res.data.data.items || []);
                setUnreadCount(res.data.data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Không thể tải thông báo:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000); // Tự động làm mới mỗi 15s
        return () => clearInterval(interval);
    }, []);

    // Xử lý Đồng ý hoặc Từ chối lời mời
    const handleRespond = async (notif: NotificationItem, accept: boolean) => {
        if (!notif.relatedEntityId) return;
        try {
            setActionLoadingId(notif.notificationId);
            await respondToInvitation(notif.relatedEntityId, accept);

            notifications.show({
                title: accept ? 'Thành công' : 'Đã từ chối',
                message: accept ? 'Bạn đã tham gia khóa học!' : 'Đã từ chối lời mời tham gia.',
                color: accept ? 'green' : 'gray',
            });

            // Đánh dấu đã đọc và tải lại thông báo
            await apiClient.patch(`/notifications/${notif.notificationId}/read`);
            await fetchNotifications();
        } catch (err: any) {
            notifications.show({
                title: 'Thất bại',
                message: err?.response?.data?.message || 'Không thể thực hiện thao tác.',
                color: 'red',
            });
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <Popover
      opened= { opened }
    onChange = { setOpened }
    position = "bottom-end"
    withArrow
    shadow = "md"
    width = { 360}
        >
        <Popover.Target>
        <Indicator color="red" size = { 9} offset = { 3} disabled = { unreadCount === 0
}>
    <ActionIcon
            variant="subtle"
size = "lg"
color = "gray"
onClick = {() => {
    setOpened((o) => !o);
    if (!opened) fetchNotifications();
}}
          >
    <IconBell size={ 22 } />
        </ActionIcon>
        </Indicator>
        </Popover.Target>

        < Popover.Dropdown p = "sm" >
            <Group justify="space-between" mb = "xs" >
                <Text fw={ 600 } size = "sm" >
                    Thông báo({ unreadCount })
                        </Text>
                        </Group>
                        < Divider mb = "xs" />

                        { loading && items.length === 0 ? (
                            <Center py= "xl" >
                        <Loader size="sm" />
                            </Center>
        ) : items.length === 0 ? (
    <Center py= "xl" >
    <Stack align="center" gap = { 4} >
        <IconInbox size={ 32 } color = "gray" />
            <Text size="xs" c = "dimmed" >
                Chưa có thông báo nào
                    </Text>
                    </Stack>
                    </Center>
        ) : (
    <ScrollArea.Autosize mah= { 320} >
    <Stack gap="xs" >
    {
        items.map((item) => (
            <div
                  key= { item.notificationId }
                  style = {{
            padding: '8px',
            borderRadius: '6px',
            backgroundColor: item.isRead ? 'transparent' : 'rgba(255, 140, 0, 0.08)',
        }}
        >
        <Text size="xs" fw = { item.isRead ? 400 : 600 } lineClamp = { 3} >
        { item.content }
            </Text>
            < Text size = "10px" c = "dimmed" mt = { 4} >
            { new Date(item.createdAt).toLocaleString('vi-VN') }
                </Text>

{/* Nếu là thông báo mời học viên, hiện nút Đồng ý & Từ chối */ }
{
    item.type === 'COURSE_INVITATION' && !item.isRead && (
        <Group gap="xs" mt = "xs" >
            <Button
                        size="compact-xs"
    color = "orange"
    leftSection = {< IconCheck size = { 12} />}
loading = { actionLoadingId === item.notificationId}
onClick = {() => handleRespond(item, true)}
                      >
    Đồng ý
        </Button>
        < Button
size = "compact-xs"
variant = "default"
leftSection = {< IconX size = { 12} />}
loading = { actionLoadingId === item.notificationId}
onClick = {() => handleRespond(item, false)}
                      >
    Từ chối
        </Button>
        </Group>
                  )}
</div>
              ))}
</Stack>
    </ScrollArea.Autosize>
        )}
</Popover.Dropdown>
    </Popover>
  );
}