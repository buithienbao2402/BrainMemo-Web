import { useNavigate } from 'react-router-dom';
import { Box, Grid, Stack, Group, Text, ScrollArea, Loader, Paper } from '@mantine/core';
import { IconBook2, IconTrophy, IconCrown, IconUsers } from '@tabler/icons-react';
import { useNewestCourses, useCompletedCourses, useRecentlyUpdatedCourses } from '../hooks/useHomeSections';
import { CourseMiniCard } from '../components/CourseMiniCard';
import { SidebarPlaceholderCard } from '../components/SidebarPlaceholderCard';

function SectionHeader({ title, onSeeMore }: { title: string; onSeeMore: () => void }) {
    return (
        <Group justify="space-between" mb="sm">
            <Text fw={700} c="orange">{title}</Text>
            <Text size="sm" c="orange" style={{ cursor: 'pointer' }} onClick={onSeeMore}>Xem tất cả ›</Text>
        </Group>
    );
}

export function HomePage() {
    const navigate = useNavigate();
    const newest = useNewestCourses();
    const completed = useCompletedCourses();
    const recent = useRecentlyUpdatedCourses();

    return (
        <Box p="lg">
            <Grid styles={{ root: { '--grid-gutter': 'var(--mantine-spacing-lg)' } }}>
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack gap="lg">
                        <Paper shadow="sm" radius="md" p="lg">
                            <SectionHeader title="MỚI RA MẮT" onSeeMore={() => navigate('/explore?sort=newest')} />
                            {newest.isLoading ? <Loader color="orange" /> : (
                                <ScrollArea type="auto" offsetScrollbars>
                                    <Group gap="md" wrap="nowrap">
                                        {newest.data?.items.map((c) => <CourseMiniCard key={c.courseId} course={c} />)}
                                    </Group>
                                </ScrollArea>
                            )}
                        </Paper>

                        <Paper shadow="sm" radius="md" p="lg">
                            <SectionHeader title="KHÓA HỌC ĐÃ HOÀN THÀNH" onSeeMore={() => navigate('/explore?status=COMPLETED')} />
                            {completed.isLoading ? <Loader color="orange" /> : (
                                <ScrollArea type="auto" offsetScrollbars>
                                    <Group gap="md" wrap="nowrap">
                                        {completed.data?.items.map((c) => <CourseMiniCard key={c.courseId} course={c} />)}
                                    </Group>
                                </ScrollArea>
                            )}
                        </Paper>

                        <Paper shadow="sm" radius="md" p="lg">
                            <SectionHeader title="MỚI CẬP NHẬT" onSeeMore={() => navigate('/explore?sort=updated')} />
                            {recent.isLoading ? <Loader color="orange" /> : (
                                <Stack gap="sm">
                                    {recent.data?.items.map((c) => (
                                        <Group key={c.courseId} justify="space-between" style={{ cursor: 'pointer' }} onClick={() => navigate(`/courses/${c.courseId}`)}>
                                            <Stack gap={0}>
                                                <Text size="sm" fw={600}>{c.title}</Text>
                                                <Text size="xs" c="dimmed">{c.creator.fullName}</Text>
                                            </Stack>
                                            <Text size="xs" c="dimmed">
                                                <IconUsers size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                                {c.participantsCount} học viên
                                            </Text>
                                        </Group>
                                    ))}
                                </Stack>
                            )}
                        </Paper>
                    </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack gap="lg">
                        <SidebarPlaceholderCard icon={<IconBook2 size={28} />} title="Tiếp Tục Học" />
                        <SidebarPlaceholderCard icon={<IconTrophy size={28} />} title="Tổng Số Học Viên" />
                        <SidebarPlaceholderCard icon={<IconCrown size={28} />} title="Top Creator" />
                    </Stack>
                </Grid.Col>

            </Grid>
        </Box>
    );
}