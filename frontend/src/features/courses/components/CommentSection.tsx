import { useState } from 'react';
import { Avatar, Button, Group, Paper, Stack, Text, TextInput, Loader, Center } from '@mantine/core';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useComments, usePostComment } from '../hooks/useComments';
import { CommentItem } from './CommentItem';

export function CommentSection({ courseId }: { courseId: number }) {
  const { user } = useAuthStore();
  const { data, isLoading } = useComments(courseId);
  const postComment = usePostComment(courseId);
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    postComment.mutate(trimmed, { onSuccess: () => setValue('') });
  };

  return (
    <Paper shadow="sm" radius="md" p="lg">
      <Text fw={700} mb="sm">THẢO LUẬN ({data?.totalItems ?? 0})</Text>

      <Group align="center" gap="sm" mb="lg" wrap="nowrap">
        <Avatar src={user?.avatarUrl} radius="xl" color="orange">{user?.fullName?.charAt(0)}</Avatar>
        <TextInput value={value} onChange={(e) => setValue(e.currentTarget.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} placeholder="Viết bình luận..." radius="xl" style={{ flex: 1 }} />
        <Button radius="xl" color="dark" onClick={handleSubmit} loading={postComment.isPending}>Gửi</Button>
      </Group>

      {isLoading ? <Center h={100}><Loader color="orange" /></Center> : (
        <Stack gap="sm">
          {data?.items.map((comment) => <CommentItem key={comment.id} comment={comment} courseId={courseId} />)}
        </Stack>
      )}
    </Paper>
  );
}