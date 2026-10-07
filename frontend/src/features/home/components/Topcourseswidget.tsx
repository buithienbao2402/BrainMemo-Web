import { Paper, Group, Stack, Text, Box, Loader, Center, ScrollArea } from '@mantine/core';
import { IconTrophy, IconUsers } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '@/features/courses/utils/format';
import { getCourseCoverBackground } from '@/shared/utils/courseVisuals';
import { useTopCourses } from '../hooks/useHomeSections';

export function TopCoursesWidget() {
    const navigate = useNavigate();
    const { data, isLoading, isError } = useTopCourses(10);

    return (
        /* 1. Bỏ bg và c tại đây để Mantine tự quản lý sáng/tối */
        <Paper shadow="sm" radius="lg" p="lg">
            <Group gap={8} mb="md">
                <IconTrophy size={20} color="var(--mantine-color-orange-6)" />
                <Text fw={700}>TỔNG SỐ HỌC VIÊN</Text>
            </Group>

            {isLoading ? (
                <Center h={120}><Loader color="orange" size="sm" /></Center>
            ) : isError ? (
                <Center h={100}><Text size="sm" c="dimmed">Không tải được bảng xếp hạng.</Text></Center>
            ) : !data || data.length === 0 ? (
                <Center h={100}><Text size="sm" c="dimmed">Chưa có học viên nào tham gia.</Text></Center>
            ) : (
                <ScrollArea.Autosize mah={460} type="auto" offsetScrollbars>
                    <Stack gap="md">
                        {data.map((course) => (
                            <Group
                                key={course.courseId}
                                wrap="nowrap"
                                gap="sm"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/courses/${course.courseId}`)}
                            >
                                <Text
                                    w={24}
                                    ta="center"
                                    fz={20}
                                    fw={700}
                                    /* 2. Nếu không phải rank 1, để undefined để tự đổi màu đen/trắng theo theme */
                                    c={course.rank === 1 ? 'orange' : undefined}
                                >
                                    {course.rank}
                                </Text>
                                <Box
                                    w={48}
                                    h={48}
                                    style={{
                                        flexShrink: 0,
                                        borderRadius: 10,
                                        background: getCourseCoverBackground(course.coverImage),
                                    }}
                                />
                                <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                                    <Text size="sm" fw={600} lineClamp={1}>{course.title}</Text>
                                    <Group gap={4} wrap="nowrap">
                                        <IconUsers size={14} color="var(--mantine-color-dimmed)" />
                                        <Text size="xs" c="dimmed">{formatNumber(course.participantsCount)}</Text>
                                    </Group>
                                </Stack>
                            </Group>
                        ))}
                    </Stack>
                </ScrollArea.Autosize>
            )}
        </Paper>
    );
}