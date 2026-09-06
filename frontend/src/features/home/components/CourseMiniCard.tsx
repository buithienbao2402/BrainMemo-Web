import { Paper, Text, Group, Stack, ThemeIcon } from '@mantine/core';
import { IconUsers, IconMessageCircle, IconCards, IconHelpCircle, IconLock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { CourseListItem } from '@/features/explore/types/explore.types';
import { formatNumber } from '@/features/courses/utils/format';
import { getCourseCoverBackground } from '@/shared/utils/courseVisuals';

export function CourseMiniCard({ course }: { course: CourseListItem }) {
  const navigate = useNavigate();
  const isLocked = course.accessType !== 'PUBLIC';

  return (
    <Paper shadow="sm" radius="md" style={{ cursor: 'pointer', overflow: 'hidden', minWidth: 220 }} onClick={() => navigate(`/courses/${course.courseId}`)}>
      <div style={{ height: 140, background: getCourseCoverBackground(course.coverImage), position: 'relative' }}>
        {isLocked && (
          <ThemeIcon
            size={22}
            radius="xl"
            color="dark"
            variant="filled"
            style={{ position: 'absolute', top: 8, right: 8, opacity: 0.85 }}
            aria-label="Khóa học riêng tư hoặc cần mật mã"
          >
            <IconLock size={12} />
          </ThemeIcon>
        )}
      </div>
      <Stack gap={4} p="sm">
        <Text fw={700} size="sm" lineClamp={2}>{course.title}</Text>
        <Text size="xs" c="dimmed">{course.creator.fullName}</Text>
        <Group gap="sm">
          <Group gap={4}>
            <IconUsers size={14} />
            <Text size="xs" c="dimmed">{formatNumber(course.participantsCount)}</Text>
          </Group>
          {course.commentsCount != null && (
            <Group gap={4}>
              <IconMessageCircle size={14} />
              <Text size="xs" c="dimmed">{formatNumber(course.commentsCount)}</Text>
            </Group>
          )}
          {course.flashcardsCount != null && (
            <Group gap={4}>
              <IconCards size={14} />
              <Text size="xs" c="dimmed">{formatNumber(course.flashcardsCount)}</Text>
            </Group>
          )}
          {course.quizzesCount != null && (
            <Group gap={4}>
              <IconHelpCircle size={14} />
              <Text size="xs" c="dimmed">{formatNumber(course.quizzesCount)}</Text>
            </Group>
          )}
        </Group>
      </Stack>
    </Paper>
  );
}