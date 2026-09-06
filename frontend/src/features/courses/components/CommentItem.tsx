import { useState } from 'react';
import { Avatar, Group, Paper, Stack, Text, ActionIcon, TextInput, Menu } from '@mantine/core';
import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react';
import type { CourseComment } from '../types/course.types';
import { formatRelativeTime } from '../utils/format';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useUpdateComment, useDeleteComment } from '../hooks/useComments';

const AVATAR_COLORS = ['orange', 'pink', 'blue', 'teal', 'grape'];
function colorForName(name: string) { return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length]; }
function initialsForName(name: string) { return name.split(' ').slice(-2).map((w) => w.charAt(0)).join('').toUpperCase(); }

export function CommentItem({ comment, courseId }: { comment: CourseComment; courseId: number }) {
  const { user } = useAuthStore();
  const updateComment = useUpdateComment(courseId);
  const deleteComment = useDeleteComment(courseId);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(comment.content);

  const isOwner = user?.userId === comment.authorId;

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    updateComment.mutate({ id: comment.id, content: trimmed }, { onSuccess: () => setEditing(false) });
  };

  return (
    <Group align="flex-start" gap="sm" wrap="nowrap">
      <Avatar src={comment.authorAvatarUrl} radius="xl" color={colorForName(comment.authorName)}>{initialsForName(comment.authorName)}</Avatar>
      <Paper radius="md" p="sm" bg="var(--mantine-color-gray-0)" style={{ flex: 1 }}>
        <Stack gap={2}>
          <Group justify="space-between">
            <Group gap={6}>
              <Text size="sm" fw={700}>{comment.authorName}</Text>
              <Text size="xs" c="dimmed">· {formatRelativeTime(comment.createdAt)}</Text>
            </Group>
            {isOwner && (
              <Menu>
                <Menu.Target><ActionIcon variant="subtle" size="sm"><IconDots size={14} /></ActionIcon></Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => setEditing(true)}>Sửa</Menu.Item>
                  <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => deleteComment.mutate(comment.id)}>Xóa</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
          {editing ? (
            <Group gap="xs">
              <TextInput value={value} onChange={(e) => setValue(e.currentTarget.value)} style={{ flex: 1 }} size="xs" />
              <ActionIcon color="green" onClick={handleSave}>✓</ActionIcon>
            </Group>
          ) : <Text size="sm">{comment.content}</Text>}
        </Stack>
      </Paper>
    </Group>
  );
}