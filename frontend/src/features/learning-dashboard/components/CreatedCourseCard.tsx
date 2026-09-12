import { Paper, Group, Stack, Text, ThemeIcon, Button } from '@mantine/core';
import {
  IconBrandPython, IconMathFunction, IconMessageCircle, IconAtom, IconBulb, IconBrandJavascript,
  IconArrowRight, type Icon,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { CreatedCourseCard as CreatedCourseCardType } from '../types/learning-dashboard.types';

const COURSE_VISUALS: Array<{ icon: Icon; color: string }> = [
  { icon: IconBrandPython, color: 'teal' },
  { icon: IconMathFunction, color: 'indigo' },
  { icon: IconMessageCircle, color: 'teal' },
  { icon: IconAtom, color: 'violet' },
  { icon: IconBulb, color: 'pink' },
  { icon: IconBrandJavascript, color: 'yellow' },
];

export function CreatedCourseCard({ course, index }: { course: CreatedCourseCardType; index: number }) {
  const navigate = useNavigate();
  const visual = COURSE_VISUALS[index % COURSE_VISUALS.length];

  return (
    <Paper withBorder radius="md" p="lg">
      <Group align="center" wrap="nowrap">
        <ThemeIcon size={48} radius="md" color={visual.color}>
          <visual.icon size={26} />
        </ThemeIcon>
        <Text fw={700} style={{ flex: 1 }}>{course.title}</Text>
        <Button variant="light" color="orange" radius="xl" size="xs" rightSection={<IconArrowRight size={14} />} onClick={() => navigate(`/creator/courses/${course.courseId}`)}>
          Quản lý
        </Button>
      </Group>
    </Paper>
  );
}