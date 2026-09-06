import { Paper, Text, Group, Stack } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { CourseListItem } from '@/features/explore/types/explore.types';
import { formatNumber } from '@/features/courses/utils/format';

export function CourseMiniCard({ course }: { course: CourseListItem }) {
  const navigate = useNavigate();
  return (
    <Paper shadow="sm" radius="md" style={{ cursor: 'pointer', overflow: 'hidden', minWidth: 220 }} onClick={() => navigate(`/courses/${course.courseId}`)}>
      <div style={{ height: 140, background: course.coverImage ? `url(${course.coverImage}) center/cover` : 'linear-gradient(135deg,#f97316,#ea580c)' }} />
      <Stack gap={4} p="sm">
        <Text fw={700} size="sm" lineClamp={2}>{course.title}</Text>
        <Text size="xs" c="dimmed">{course.creator.fullName}</Text>
        <Group gap={4}>
          <IconUsers size={14} />
          <Text size="xs" c="dimmed">{formatNumber(course.participantsCount)}</Text>
        </Group>
      </Stack>
    </Paper>
  );
}