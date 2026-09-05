import { Avatar, Group, Paper, Stack, Text } from '@mantine/core';
import type { CourseComment } from '../types/course.types';
import { formatRelativeTime } from '../utils/format';

interface CommentItemProps {
  comment: CourseComment;
}

const AVATAR_COLORS = ['orange', 'pink', 'blue', 'teal', 'grape'];

function colorForName(name: string) {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function initialsForName(name: string) {
  return name
    .split(' ')
    .slice(-2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
}

export function CommentItem({ comment }: CommentItemProps) {
  return (
    <Group align="flex-start" gap="sm" wrap="nowrap">
      <Avatar src={comment.authorAvatarUrl} radius="xl" color={colorForName(comment.authorName)}>
        {initialsForName(comment.authorName)}
      </Avatar>

      <Paper radius="md" p="sm" bg="var(--mantine-color-gray-0)" style={{ flex: 1 }}>
        <Stack gap={2}>
          <Group gap={6}>
            <Text size="sm" fw={700}>
              {comment.authorName}
            </Text>
            <Text size="xs" c="dimmed">
              · {formatRelativeTime(comment.createdAt)}
            </Text>
          </Group>
          <Text size="sm">{comment.content}</Text>
        </Stack>
      </Paper>
    </Group>
  );
}
