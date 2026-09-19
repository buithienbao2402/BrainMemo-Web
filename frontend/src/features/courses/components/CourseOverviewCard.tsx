import { Badge, Button, Group, Paper, Stack } from '@mantine/core';
import { IconBook2, IconPlayerPlayFilled } from '@tabler/icons-react';
import { CourseCoverImage } from './CourseCoverImage';
import { CourseProgressBar } from './CourseProgressBar';
import { CourseStatsRow } from './CourseStatsRow';
import classes from './CourseOverviewCard.module.css';

interface CourseOverviewCardProps {
  coverImageUrl?: string | null;
  eyebrow: string;
  title: string;
  chaptersCount: number;
  flashcardsCount: number;
  quizzesCount: number;
  tags: string[];
  progressPercent: number;
  currentChapterOrderIndex: number | null;
  onStartLearning?: () => void;
  onContinueLearning?: () => void;
  isStartingLearning?: boolean; // MỚI
}

export function CourseOverviewCard({
  coverImageUrl,
  eyebrow,
  title,
  chaptersCount,
  flashcardsCount,
  quizzesCount,
  tags,
  progressPercent,
  currentChapterOrderIndex,
  onStartLearning,
  onContinueLearning,
  isStartingLearning,
}: CourseOverviewCardProps) {
  return (
    <Paper shadow="sm" radius="md" className={classes.card}>
      <CourseCoverImage imageUrl={coverImageUrl} eyebrow={eyebrow} title={title} />

      <Stack gap="md" p="lg">
        <Group grow>
          <Button
            variant="outline"
            color="orange"
            leftSection={<IconBook2 size={16} />}
            onClick={onStartLearning}
            loading={isStartingLearning}
          >
            Bắt đầu học
          </Button>

          {/* FIX: orderIndex bắt đầu từ 0 trong DB -> phải check != null, không được dùng truthy check */}
          {currentChapterOrderIndex != null && (
            <Button
              color="dark"
              leftSection={<IconPlayerPlayFilled size={14} />}
              onClick={onContinueLearning}
            >
              Học tiếp C{currentChapterOrderIndex}
            </Button>
          )}
        </Group>

        <CourseStatsRow
          chaptersCount={chaptersCount}
          flashcardsCount={flashcardsCount}
          quizzesCount={quizzesCount}
        />

        <Group gap="xs">
          {tags.map((tag) => (
            <Badge key={tag} variant="light" color="gray" radius="sm">
              {tag}
            </Badge>
          ))}
        </Group>

        <CourseProgressBar percent={progressPercent} />
      </Stack>
    </Paper>
  );
}