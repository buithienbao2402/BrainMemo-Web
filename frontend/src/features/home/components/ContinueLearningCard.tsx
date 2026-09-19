import { Paper, Stack, Text, Group, Progress, Badge, ThemeIcon, Center, Divider, ScrollArea } from '@mantine/core';
import {
  IconBook2,
  IconBrandPython,
  IconMathFunction,
  IconMessageCircle,
  IconAtom,
  IconBulb,
  IconBrandJavascript,
  type Icon,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { DashboardCourseCard } from '@/features/learning-dashboard/types/learning-dashboard.types';

// Giữ đúng bộ icon/màu đang dùng ở CourseProgressCard.tsx & CreatorDashboard.tsx để đồng bộ
// hình ảnh xuyên suốt app — chưa tách ra shared/constants vì chỉ đang lặp 3 chỗ, có thể gộp sau.
const COURSE_VISUALS: Array<{ icon: Icon; color: string }> = [
  { icon: IconBrandPython, color: 'orange' },
  { icon: IconMathFunction, color: 'indigo' },
  { icon: IconMessageCircle, color: 'blue' },
  { icon: IconAtom, color: 'violet' },
  { icon: IconBulb, color: 'pink' },
  { icon: IconBrandJavascript, color: 'green' },
];

function ContinueLearningRow({ course, index }: { course: DashboardCourseCard; index: number }) {
  const navigate = useNavigate();
  const visual = COURSE_VISUALS[index % COURSE_VISUALS.length];

  const handleClick = () => {
    if (course.currentChapterId) {
      navigate(
        `/courses/${course.courseId}/learn/${course.currentChapterId}${course.currentPageId ? `/${course.currentPageId}` : ''}`
      );
    } else {
      navigate(`/courses/${course.courseId}`);
    }
  };

  return (
    <Group align="center" gap="sm" wrap="nowrap" style={{ cursor: 'pointer' }} onClick={handleClick}>
      <ThemeIcon size={44} radius="md" color={visual.color} variant="light">
        <visual.icon size={22} />
      </ThemeIcon>
      <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
        <Text fw={700} size="sm" lineClamp={1}>
          {course.title}
        </Text>
        <Text size="xs" c="dimmed" lineClamp={1}>
          {course.currentChapterOrderIndex != null
            ? `Chương ${course.currentChapterOrderIndex}${course.currentChapterTitle ? `: ${course.currentChapterTitle}` : ''}`
            : 'Chưa đọc trang nào'}
        </Text>
        <Progress value={course.progressPercent} color="orange" size="sm" radius="xl" />
      </Stack>
    </Group>
  );
}

export function ContinueLearningCard({ courses }: { courses: DashboardCourseCard[] }) {
  return (
    <Paper shadow="sm" radius="md" p="lg">
      <Group justify="space-between" mb="md">
        <Group gap={8}>
          <IconBook2 size={20} color="var(--mantine-color-orange-6)" />
          <Text fw={700}>Tiếp Tục Học</Text>
        </Group>
        {courses.length > 0 && (
          <Badge color="orange" variant="light" radius="xl">
            {courses.length} khóa
          </Badge>
        )}
      </Group>

      {courses.length === 0 ? (
        <Center h={100}>
          <Stack gap={4} align="center">
            <IconBook2 size={28} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">Chưa có khóa học nào đang học</Text>
          </Stack>
        </Center>
      ) : (
        <ScrollArea.Autosize mah={360} type="auto" offsetScrollbars>
          <Stack gap="sm">
            {courses.map((course, index) => (
              <div key={course.courseId}>
                <ContinueLearningRow course={course} index={index} />
                {index < courses.length - 1 && <Divider mt="sm" />}
              </div>
            ))}
          </Stack>
        </ScrollArea.Autosize>
      )}
    </Paper>
  );
}