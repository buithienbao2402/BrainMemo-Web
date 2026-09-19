import { Paper, Stack, Text, Group, Progress, Button, Center } from '@mantine/core';
import { IconBook2, IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getCourseCoverBackground } from '@/shared/utils/courseVisuals';
import type { DashboardCourseCard } from '@/features/learning-dashboard/types/learning-dashboard.types';

export function ContinueLearningCard({ course }: { course: DashboardCourseCard | undefined }) {
  const navigate = useNavigate();

  if (!course) {
    return (
      <Paper shadow="sm" radius="md" p="lg">
        <Stack gap="xs">
          <Text fw={700}>Tiếp Tục Học</Text>
          <Center h={100}>
            <Stack gap={4} align="center">
              <IconBook2 size={28} />
              <Text size="xs" c="dimmed">Chưa có khóa học nào đang học</Text>
            </Stack>
          </Center>
        </Stack>
      </Paper>
    );
  }

  const handleContinue = () => {
    if (course.currentChapterId) {
      navigate(
        `/courses/${course.courseId}/learn/${course.currentChapterId}${course.currentPageId ? `/${course.currentPageId}` : ''}`
      );
    } else {
      navigate(`/courses/${course.courseId}`);
    }
  };

  return (
    <Paper shadow="sm" radius="md" style={{ overflow: 'hidden' }}>
      <div style={{ height: 90, background: getCourseCoverBackground(course.coverImage) }} />
      <Stack gap={6} p="md">
        <Text fw={700} size="sm" lineClamp={1}>{course.title}</Text>
        {course.currentChapterTitle && (
          <Text size="xs" c="dimmed" lineClamp={1}>{course.currentChapterTitle}</Text>
        )}
        <Group justify="space-between" gap={4}>
          <Progress value={course.progressPercent} color="orange" size="sm" radius="xl" style={{ flex: 1 }} />
          <Text size="xs" c="dimmed">{Math.round(course.progressPercent)}%</Text>
        </Group>
        <Button size="xs" color="orange" radius="xl" rightSection={<IconArrowRight size={14} />} onClick={handleContinue}>
          Học tiếp
        </Button>
      </Stack>
    </Paper>
  );
}