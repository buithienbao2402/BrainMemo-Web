import { Paper, Stack, Text, SimpleGrid, Box } from '@mantine/core';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { LearningDashboardSummary } from '../types/learning-dashboard.types';

export function ProfileSidebarCard({ data }: { data: LearningDashboardSummary }) {
  const user = useAuthStore((s) => s.user);
  const coursesLearningCount = data.courses.learning.length;
  const coursesCompletedCount = data.courses.completed.length;

  return (
    <Paper shadow="sm" radius="md" style={{ overflow: 'hidden' }}>
      <Box h={100} bg="orange" />
      <Stack align="center" gap={4} mt={-40} pb="md" px="md">
        <UserAvatar fullName={user?.fullName} avatarUrl={user?.avatarUrl} size={80} style={{ border: '4px solid white' }} />
        <Text fw={700} size="lg" mt={8}>{user?.fullName}</Text>
        {data.bio && (
          <Text size="xs" c="dimmed" ta="center">{data.bio}</Text>
        )}

        <SimpleGrid cols={3} spacing={4} mt="sm" w="100%">
          <Stack gap={0} align="center">
            <Text fw={700}>{data.chaptersReadCount}</Text>
            <Text size="xs" c="dimmed" ta="center">Chương đã đọc</Text>
          </Stack>
          <Stack gap={0} align="center">
            <Text fw={700}>{coursesLearningCount}</Text>
            <Text size="xs" c="dimmed" ta="center">Khóa học đang theo dõi</Text>
          </Stack>
          <Stack gap={0} align="center">
            <Text fw={700}>{coursesCompletedCount}</Text>
            <Text size="xs" c="dimmed" ta="center">Hoàn thành</Text>
          </Stack>
        </SimpleGrid>

        <Paper withBorder radius="md" p="sm" mt="sm" w="100%">
          <Stack align="center" gap={0}>
            <Text fw={700}>{data.coursesCreatedCount}</Text>
            <Text size="xs" c="dimmed">Khóa học đã tạo</Text>
          </Stack>
        </Paper>
      </Stack>
    </Paper>
  );
}