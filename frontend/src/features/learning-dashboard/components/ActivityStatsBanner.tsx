import { Paper, Group, Text } from '@mantine/core';
import { IconChartBar } from '@tabler/icons-react';

function formatHours(totalSeconds: number): string {
  return `${Math.floor(totalSeconds / 3600)}h`;
}

export function ActivityStatsBanner({ totalActiveSeconds, commentsCount }: { totalActiveSeconds: number; commentsCount: number }) {
  return (
    <Paper radius="md" p="xl" bg="dark.8" c="white">
      <Group gap={8} mb="lg">
        <IconChartBar size={20} color="var(--mantine-color-orange-5)" />
        <Text fw={700}>Thống kê hoạt động</Text>
      </Group>

      <Group gap="md">
        <Paper radius="md" p="lg" bg="dark.6" style={{ flex: 1 }}>
          <Text fz={28} fw={700}>{formatHours(totalActiveSeconds)}</Text>
          <Text size="sm" c="dimmed">Tổng số giờ học</Text>
        </Paper>
        <Paper radius="md" p="lg" bg="dark.6" style={{ flex: 1 }}>
          <Text fz={28} fw={700}>{commentsCount}</Text>
          <Text size="sm" c="dimmed">Số lượt bình luận</Text>
        </Paper>
      </Group>
    </Paper>
  );
}