import { Paper, Group, Stack, Text, Table, Box, Loader, Center } from '@mantine/core';
import { IconTrophy, IconCrown } from '@tabler/icons-react';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { useAuthStore } from '@/features/auth/store/authStore';
import { formatNumber } from '@/features/courses/utils/format';
import { useLeaderboard } from '../hooks/useHomeSections';
import type { LeaderboardUser } from '../api/leaderboard.api';

const PODIUM_META: Record<1 | 2 | 3, { color: string; barHeight: number; avatarSize: number }> = {
    1: { color: '#FFC107', barHeight: 92, avatarSize: 68 }, // Vàng
    2: { color: '#ADB5BD', barHeight: 68, avatarSize: 56 }, // Bạc
    3: { color: '#CD7F32', barHeight: 52, avatarSize: 56 }, // Đồng
};

function PodiumItem({ user, isMe }: { user: LeaderboardUser; isMe: boolean }) {
    const meta = PODIUM_META[user.rank as 1 | 2 | 3];

    return (
        <Stack align= "center" gap = { 4} style = {{ flex: 1, minWidth: 0 }
}>
{ user.rank === 1 ? <IconCrown size={ 22 } color = { meta.color } /> : <Box h={ 22 } />}
<UserAvatar
        fullName={ user.fullName }
avatarUrl = { user.avatarUrl }
size = { meta.avatarSize }
style = {{ border: `3px solid ${meta.color}` }}
      />
    < Text size = "sm" fw = { 700} lineClamp = { 1} ta = "center" c = { isMe? 'orange': undefined } >
    { user.fullName }{ isMe ? ' (Bạn)' : '' }
</Text>
    < Text size = "xs" c = "dimmed" > { formatNumber(user.totalScore) } điểm </Text>
        < Box
w = "100%"
h = { meta.barHeight }
style = {{
    background: meta.color,
        borderRadius: '8px 8px 0 0',
            display: 'flex',
                alignItems: 'center',
                    justifyContent: 'center',
        }}
      >
    <Text fz={ 26 } fw = { 800} c = "white" > { user.rank } </Text>
        </Box>
        </Stack>
  );
}

export function LeaderboardWidget() {
    const currentUserId = useAuthStore((s) => s.user?.userId);
    const { data, isLoading, isError } = useLeaderboard(10);

    const myId = currentUserId != null ? Number(currentUserId) : null;
    const top3 = (data ?? []).slice(0, 3);
    const rest = (data ?? []).slice(3);
    // Sắp xếp bục: hạng 2 - hạng 1 - hạng 3 (hạng 1 đứng giữa, cao nhất)
    const podium = [top3[1], top3[0], top3[2]].filter((u): u is LeaderboardUser => Boolean(u));

    return (
        <Paper shadow= "sm" radius = "md" p = "lg" >
            <Group gap={ 8 } mb = "md" >
                <IconTrophy size={ 20 } color = "var(--mantine-color-orange-6)" />
                    <Text fw={ 700 }> Bảng Xếp Hạng </Text>
                        </Group>

    {
        isLoading ? (
            <Center h= { 120} > <Loader color="orange" size = "sm" /> </Center>
      ) : isError ? (
            <Center h= { 100} > <Text size="sm" c = "dimmed" > Không tải được bảng xếp hạng.< /Text></Center >
      ) : !data || data.length === 0 ? (
            <Center h= { 100} > <Text size="sm" c = "dimmed" > Chưa có dữ liệu xếp hạng < /Text></Center >
      ) : (
            <Stack gap= "md" >
            <Group align="flex-end" wrap = "nowrap" gap = "xs" >
            {
                podium.map((u) => (
                    <PodiumItem key= { u.userId } user = { u } isMe = { u.userId === myId } />
            ))
            }
                </Group>

        {
            rest.length > 0 && (
                <Table verticalSpacing="xs" highlightOnHover >
                    <Table.Thead>
                    <Table.Tr>
                    <Table.Th w={ 48 }> Hạng </Table.Th>
                        < Table.Th > Học viên </Table.Th>
                            < Table.Th ta = "right" > Điểm </Table.Th>
                                </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
            {
                rest.map((u) => {
                    const isMe = u.userId === myId;
                    return (
                        <Table.Tr
                      key= { u.userId }
                    style = { isMe? { backgroundColor: 'var(--mantine-color-orange-light)' } : undefined
                }
                    >
                    <Table.Td><Text size="sm" fw = { 600} c = "dimmed" >#{ u.rank } < /Text></Table.Td >
                <Table.Td>
                <Group gap="xs" wrap = "nowrap" >
                <UserAvatar fullName={ u.fullName } avatarUrl = { u.avatarUrl } size = "sm" />
                <Text size="sm" lineClamp = { 1} fw = { isMe? 700: 500 } >
                { u.fullName }{ isMe? ' (Bạn)': '' }
                </Text>
                </Group>
                </Table.Td>
                < Table.Td ta = "right" >
                <Text size="sm" fw = { 700} > { formatNumber(u.totalScore)
            } </Text>
                </Table.Td>
                </Table.Tr>
                  );
        })
    }
    </Table.Tbody>
        </Table>
          )
}
</Stack>
      )}
</Paper>
  );
}