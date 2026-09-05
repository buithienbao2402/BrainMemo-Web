import { Progress, Stack, Text } from '@mantine/core';

interface CourseProgressBarProps {
  percent: number;
}

export function CourseProgressBar({ percent }: CourseProgressBarProps) {
  return (
    <Stack gap={6}>
      <Progress value={percent} size="lg" radius="xl" color="orange" />
      <Text size="sm" c="dimmed">
        Tiến độ học tập:{' '}
        <Text component="span" size="sm" fw={700} c="dark" inherit>
          {percent}%
        </Text>
      </Text>
    </Stack>
  );
}
