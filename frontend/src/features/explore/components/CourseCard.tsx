import { Paper, Text, Badge, Group, Stack, ThemeIcon  } from '@mantine/core';
import { IconEye, IconLock  } from '@tabler/icons-react';
import type { CourseListItem } from '../types/explore.types';
import { COURSE_STATUS_LABEL, COURSE_STATUS_COLOR } from '@/features/courses/utils/courseLabels';
import { formatNumber } from '@/features/courses/utils/format';
import { getCourseCoverBackground } from '@/shared/utils/courseVisuals';

export function CourseCard({ course, onClick }: { course: CourseListItem; onClick: () => void }) {
  const isLocked = course.accessType !== 'PUBLIC';

  return (
    <Paper shadow="sm" radius="md" style={{ cursor: 'pointer', overflow: 'hidden' }} onClick={onClick}>
      <div style={{ position: 'relative', height: 200, background: getCourseCoverBackground(course.coverImage) }}>
        <Group gap={4} style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 4 }}>
          <IconEye size={12} color="white" />
          <Text size="xs" c="white">{formatNumber(course.participantsCount)}</Text>
        </Group>
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
        <Badge size="xs" color={COURSE_STATUS_COLOR[course.status]} variant="light">{COURSE_STATUS_LABEL[course.status]}</Badge>
      </Stack>
    </Paper>
  );
}