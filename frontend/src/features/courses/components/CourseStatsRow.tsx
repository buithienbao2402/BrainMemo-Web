import { Group, Stack, Text } from '@mantine/core';

interface CourseStatsRowProps {
  chaptersCount: number;
  flashcardsCount: number;
  quizzesCount: number;
}

export function CourseStatsRow({ chaptersCount, flashcardsCount, quizzesCount }: CourseStatsRowProps) {
  const stats = [
    { label: 'Chương', value: chaptersCount },
    { label: 'Flashcard', value: flashcardsCount },
    { label: 'Quiz', value: quizzesCount },
  ];

  return (
    <Group justify="space-between" grow>
      {stats.map((stat) => (
        <Stack key={stat.label} gap={2} align="center">
          <Text fw={700} size="xl">
            {stat.value}
          </Text>
          <Text size="xs" c="dimmed">
            {stat.label}
          </Text>
        </Stack>
      ))}
    </Group>
  );
}
