import { Paper, Group, Stack, Text, Loader, Center, Divider, ScrollArea } from '@mantine/core';
import { IconCrown } from '@tabler/icons-react';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { formatNumber } from '@/features/courses/utils/format';
import { useTopCreators } from '../hooks/useHomeSections';

// Card sáng theo Figma "TOP CREATOR": top 10 creator có nhiều học viên (distinct) nhất.
// Bỏ nhãn "Tháng này" và toggle Tuần/Tháng vì hiện chỉ tính toàn thời gian.
export function TopCreatorsWidget() {
    const { data, isLoading, isError } = useTopCreators(10);

    return (
        <Paper shadow="sm" radius="lg">
            <Group gap={8} p="md">
                <IconCrown size={20} color="var(--mantine-color-orange-6)" />
                <Text fw={700}>TOP CREATOR</Text>
            </Group>
            <Divider />

            {isLoading ? (
                <Center h={120}><Loader color="orange" size="sm" /></Center>
            ) : isError ? (
                <Center h={100}><Text size="sm" c="dimmed">Không tải được bảng xếp hạng.</Text></Center>
            ) : !data || data.length === 0 ? (
                <Center h={100}><Text size="sm" c="dimmed">Chưa có creator nào có học viên.</Text></Center>
            ) : (
                <ScrollArea.Autosize mah={520} type="auto" offsetScrollbars>
                    <Stack gap="md" p="md">
                        {data.map((creator) => (
                            <Group key={creator.userId} wrap="nowrap" gap="sm">
                                <UserAvatar fullName={creator.fullName} avatarUrl={creator.avatarUrl} size={44} />
                                <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                                    <Text size="sm" fw={700} lineClamp={1}>{creator.fullName}</Text>
                                    <Text size="xs" c="dimmed">
                                        {formatNumber(creator.studentsCount)} học viên • {creator.coursesCount} khóa
                                    </Text>
                                </Stack>
                            </Group>
                        ))}
                    </Stack>
                </ScrollArea.Autosize>
            )}
        </Paper>
    );
}