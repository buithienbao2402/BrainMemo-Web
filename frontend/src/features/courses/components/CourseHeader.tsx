import { Group, Text, Title } from '@mantine/core';
import { IconClock, IconUser, IconUsers } from '@tabler/icons-react';
import { formatNumber, formatRelativeTime } from '../utils/format';

interface CourseHeaderProps {
  title: string;
  creatorName: string;
  updatedAt: string;
  participantsCount: number;
}

export function CourseHeader({ title, creatorName, updatedAt, participantsCount }: CourseHeaderProps) {
  return (
    <div>
      <Title order={2} mb={6}>
        {title}
      </Title>

      <Group gap={6} c="dimmed">
        <IconUser size={14} />
        <Text size="sm">Creator: {creatorName}</Text>
        <Text size="sm">·</Text>
        <IconClock size={14} />
        <Text size="sm">Cập nhật {formatRelativeTime(updatedAt)}</Text>
        <Text size="sm">·</Text>
        <IconUsers size={14} />
        <Text size="sm">{formatNumber(participantsCount)} học viên</Text>
      </Group>
    </div>
  );
}
