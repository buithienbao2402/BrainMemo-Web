import { Button, Group, Paper, ScrollArea, Stack, Text } from '@mantine/core';
import { IconArrowsSort } from '@tabler/icons-react';
import type { ChapterSummary } from '../types/course.types';
import { ChapterListItem } from './ChapterListItem';

interface ChapterListProps {
  chapters: ChapterSummary[];
  onSelectChapter?: (chapterId: number) => void;
}

export function ChapterList({ chapters, onSelectChapter }: ChapterListProps) {
  const sortedChapters = [...chapters].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <Paper shadow="sm" radius="md" p="lg">
      <Group justify="space-between" mb="sm">
        <Text fw={700}>DANH SÁCH CHƯƠNG ({chapters.length})</Text>
        <Button variant="subtle" color="gray" size="xs" leftSection={<IconArrowsSort size={14} />}>
          Sắp xếp mới nhất
        </Button>
      </Group>

      <ScrollArea.Autosize mah={320} type="auto" offsetScrollbars>
        <Stack gap={4}>
          {sortedChapters.map((chapter) => (
            <ChapterListItem key={chapter.id} chapter={chapter} onSelect={onSelectChapter} />
          ))}
        </Stack>
      </ScrollArea.Autosize>
    </Paper>
  );
}
