import { useMemo, useState } from 'react';
import {
    Alert, Badge, Button, Card, Center, Group, Modal, Skeleton, Stack, Table, Text, TextInput,
} from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { IconAlertCircle, IconSearch, IconSend } from '@tabler/icons-react';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { extractApiErrorMessage } from '@/shared/hooks/usePasscodeAccess';
import { useCourseInvitations } from '../hooks/useCourseDetail';
import { useSendInvitation, useRevokeInvitation } from '../hooks/useInvitations';
import type { CourseInvitation, InvitationStatus } from '../types/course-detail.types';

const STATUS_META: Record<InvitationStatus, { label: string; color: string }> = {
    PENDING: { label: 'Chờ phản hồi', color: 'yellow' },
    ACCEPTED: { label: 'Đã tham gia', color: 'green' },
    DECLINED: { label: 'Đã từ chối', color: 'red' },
};

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('vi-VN');
}

export function InvitationsTab({ courseId }: { courseId: string }) {
    const { data, isLoading, isError } = useCourseInvitations(courseId);
    const sendInvitation = useSendInvitation(courseId);
    const revokeInvitation = useRevokeInvitation(courseId);

    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebouncedValue(search, 300);

    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);

    const filtered = useMemo<CourseInvitation[]>(() => {
        const list = data ?? [];
        const q = debouncedSearch.trim().toLowerCase();
        if (!q) return list;
        return list.filter(
            (i) =>
                i.inviteeEmail.toLowerCase().includes(q) ||
                (i.inviteeFullName ?? '').toLowerCase().includes(q)
        );
    }, [data, debouncedSearch]);

    const handleCloseModal = () => {
        if (sendInvitation.isPending) return;
        setEmail('');
        setEmailError(null);
        closeModal();
    };

    const handleSend = () => {
        const trimmed = email.trim();
        if (!EMAIL_REGEX.test(trimmed)) {
            setEmailError('Email không hợp lệ');
            return;
        }
        setEmailError(null);
        sendInvitation.mutate(trimmed, {
            onSuccess: () => {
                notifications.show({ title: 'Thành công', message: `Đã gửi lời mời tới ${trimmed}.`, color: 'green' });
                setEmail('');
                closeModal();
            },
            onError: (err) => setEmailError(extractApiErrorMessage(err, 'Không thể gửi lời mời.')),
        });
    };

    const handleRevoke = (invitation: CourseInvitation) => {
        modals.openConfirmModal({
            title: 'Thu hồi lời mời',
            children: (
                <Text size= "sm" >
                Bạn có chắc muốn thu hồi lời mời gửi tới<b>{ invitation.inviteeEmail }</b>?
            </Text>
        ),
            labels: { confirm: 'Thu hồi', cancel: 'Hủy' },
        confirmProps: { color: 'red' },
        onConfirm: () =>
            revokeInvitation.mutate(invitation.invitationId, {
                onSuccess: () =>
                    notifications.show({ title: 'Đã thu hồi', message: 'Lời mời đã được thu hồi.', color: 'green' }),
                onError: (err) =>
                    notifications.show({
                        title: 'Có lỗi xảy ra',
                        message: extractApiErrorMessage(err, 'Không thể thu hồi lời mời.'),
                        color: 'red',
                    }),
            }),
    });
};

return (
    <>
    <Card withBorder radius = "md" padding = "lg" >
        <Group justify="space-between" mb = "md" wrap = "nowrap" >
            <TextInput
            placeholder="Tìm theo email hoặc tên học viên..."
leftSection = {< IconSearch size = { 16} />}
value = { search }
onChange = {(e) => setSearch(e.currentTarget.value)}
style = {{ flex: 1, maxWidth: 400 }}
          />
    < Button leftSection = {< IconSend size = { 16} />} onClick = { openModal } >
        Gửi lời mời
            </Button>
            </Group>

{
    isError && (
        <Alert color="red" icon = {< IconAlertCircle size = { 16} />} title = "Không tải được dữ liệu" >
            Không thể tải danh sách lời mời.Vui lòng thử lại.
          </Alert>
        )}

{
    !isError && isLoading && (
        <Stack gap="xs" >
        {
            Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key= { i } height = { 44} radius = "sm" />
            ))
        }
            </Stack>
        )
}

{
    !isError && !isLoading && filtered.length === 0 && (
        <Center py="xl" >
            <Text size="sm" c = "dimmed" >
                {(data?.length ?? 0) === 0 ? 'Chưa có lời mời nào được gửi.' : 'Không tìm thấy kết quả phù hợp.'
}
</Text>
    </Center>
        )}

{
    !isError && !isLoading && filtered.length > 0 && (
        <Table verticalSpacing="sm" highlightOnHover >
            <Table.Thead>
            <Table.Tr>
            <Table.Th>Học viên </Table.Th>
                < Table.Th > Email </Table.Th>
                < Table.Th w = { 130} > Ngày mời </Table.Th>
                    < Table.Th w = { 150} > Trạng thái </Table.Th>
                        < Table.Th w = { 120} ta = "center" > Thao tác </Table.Th>
                            </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
    {
        filtered.map((inv) => {
            const meta = STATUS_META[inv.status];
            return (
                <Table.Tr key= { inv.invitationId } >
                <Table.Td>
                <Group gap="sm" wrap = "nowrap" >
                    <UserAvatar
                          fullName={ inv.inviteeFullName ?? inv.inviteeEmail }
            avatarUrl = { inv.inviteeAvatarUrl }
            size = "sm"
                />
                <Text size="sm" fw = { 500} > { inv.inviteeFullName ?? '—' } </Text>
                    </Group>
                    </Table.Td>
                    < Table.Td > <Text size="sm" > { inv.inviteeEmail } < /Text></Table.Td >
                        <Table.Td><Text size="sm" c = "dimmed" > { formatDate(inv.createdAt)
    } </Text></Table.Td >
        <Table.Td>
        <Badge color={ meta.color } variant = "light" > { meta.label } </Badge>
            </Table.Td>
            < Table.Td ta = "center" >
                <Button
                        size="xs"
    variant = "light"
    color = "red"
    disabled = { inv.status !== 'PENDING' }
    loading = {
        revokeInvitation.isPending && revokeInvitation.variables === inv.invitationId
    }
    onClick = {() => handleRevoke(inv)
}
                      >
    Thu hồi
        </Button>
        </Table.Td>
        </Table.Tr>
                );
              })}
</Table.Tbody>
    </Table>
        )}
</Card>

    < Modal opened = { modalOpened } onClose = { handleCloseModal } title = "Mời học viên tham gia" centered >
        <Stack gap="md" >
            <TextInput
            label="Email học viên"
placeholder = "student@gmail.com"
value = { email }
onChange = {(e) => {
    setEmail(e.currentTarget.value);
    setEmailError(null);
}}
onKeyDown = {(e) => e.key === 'Enter' && handleSend()}
error = { emailError }
data-autofocus
    />
    <Group justify="flex-end" >
        <Button variant="default" onClick = { handleCloseModal } disabled = { sendInvitation.isPending } >
            Hủy
            </Button>
            < Button onClick = { handleSend } loading = { sendInvitation.isPending } >
                Gửi lời mời
                    </Button>
                    </Group>
                    </Stack>
                    </Modal>
                    </>
  );
}