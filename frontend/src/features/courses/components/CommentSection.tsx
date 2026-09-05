import { useState } from 'react';
import { Avatar, Button, Group, Paper, Stack, Text, TextInput } from '@mantine/core';
import type { CourseComment } from '../types/course.types';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
  comments: CourseComment[];
  currentUserName?: string;
  currentUserAvatarUrl?: string;
  onSubmitComment?: (content: string) => void;
}

export function CommentSection({
  comments,
  currentUserName = 'Bạn',
  currentUserAvatarUrl,
  onSubmitComment,
}: CommentSectionProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmitComment?.(trimmed);
    setValue('');
  };

  return (
    <Paper shadow="sm" radius="md" p="lg">
      <Text fw={700} mb="sm">
        THẢO LUẬN ({comments.length})
      </Text>

      <Group align="center" gap="sm" mb="lg" wrap="nowrap">
        <Avatar src={currentUserAvatarUrl} radius="xl" color="orange">
          {currentUserName.charAt(0)}
        </Avatar>
        <TextInput
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSubmit()}
          placeholder="Viết bình luận..."
          radius="xl"
          style={{ flex: 1 }}
        />
        <Button radius="xl" color="dark" onClick={handleSubmit}>
          Gửi
        </Button>
      </Group>

      <Stack gap="sm">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </Stack>
    </Paper>
  );
}
