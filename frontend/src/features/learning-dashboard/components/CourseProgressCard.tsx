import { Paper, Group, Stack, Text, Progress, Button, ThemeIcon } from '@mantine/core';
import {
  IconBrandPython, IconMathFunction, IconMessageCircle, IconAtom, IconBulb, IconBrandJavascript,
  IconArrowRight, type Icon,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { DashboardCourseCard } from '../types/learning-dashboard.types';

const COURSE_VISUALS: Array<{ icon: Icon; color: string }> = [
  { icon: IconBrandPython, color: 'teal' },
  { icon: IconMathFunction, color: 'indigo' },
  { icon: IconMessageCircle, color: 'teal' },
  { icon: IconAtom, color: 'violet' },
  { icon: IconBulb, color: 'pink' },
  { icon: IconBrandJavascript, color: 'yellow' },
];

export function CourseProgressCard({ course, index }: { course: DashboardCourseCard; index: number }) {
  const navigate = useNavigate();
  const visual = COURSE_VISUALS[index % COURSE_VISUALS.length];

  const handleContinue = () => {
    if (course.currentChapterId) {
      navigate(`/courses/${course.courseId}/learn/${course.currentChapterId}${course.currentPageId ? `/${course.currentPageId}` : ''}`);
    } else {
      navigate(`/courses/${course.courseId}`);
    }
  };

  return (
    <Paper withBorder radius="md" p="lg">
      <Group align="flex-start" wrap="nowrap">
        <ThemeIcon size={48} radius="md" color={visual.color}>
          <visual.icon size={26} />
        </ThemeIcon>
        <Stack gap={4} style={{ flex: 1 }}>
          <Text fw={700}>{course.title}</Text>
          {course.currentChapterOrderIndex != null && (
            <Text size="sm" c="dimmed">Tiếp tục: Chương {course.currentChapterOrderIndex}</Text>
          )}

          <Group justify="space-between" mt={4}>
            <Text size="xs" c="dimmed">Tiến độ</Text>
            <Text size="xs" fw={600}>{Math.round(course.progressPercent)}%</Text>
          </Group>
          <Progress value={course.progressPercent} color="orange" size="sm" radius="xl" />

          <Button color="orange" radius="xl" size="xs" mt="sm" rightSection={<IconArrowRight size={14} />} onClick={handleContinue}>
            Học tiếp
          </Button>
        </Stack>
      </Group>
    </Paper>
  );
}