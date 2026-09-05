import { Badge, Group, Text, UnstyledButton } from '@mantine/core';
import privateIcon from '@/assets/course-icon-private-final.png';
import protectedIcon from '@/assets/course-icon-protected-final.png';
import type { ChapterSummary } from '../types/course.types';
import classes from './ChapterList.module.css';

interface ChapterListItemProps {
  chapter: ChapterSummary;
  onSelect?: (chapterId: number) => void;
}

export function ChapterListItem({ chapter, onSelect }: ChapterListItemProps) {
  const { id, orderIndex, title, accessType, isCurrent } = chapter;

  return (
    <UnstyledButton className={classes.item} onClick={() => onSelect?.(id)}>
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <div className={isCurrent ? classes.badgeCurrent : classes.badgeIndex}>{orderIndex}</div>
          <Text size="sm" fw={isCurrent ? 700 : 500} c={isCurrent ? 'orange' : undefined}>
            {title}
          </Text>
        </Group>

        <Group gap={6} wrap="nowrap">
          {isCurrent && (
            <Badge color="orange" variant="filled" size="sm">
              ĐANG HỌC
            </Badge>
          )}
          {accessType === 'PRIVATE' && (
            <img src={privateIcon} alt="Riêng tư" className={classes.accessIcon} />
          )}
          {accessType === 'PROTECTED' && (
            <img src={protectedIcon} alt="Có mật khẩu" className={classes.accessIcon} />
          )}
        </Group>
      </Group>
    </UnstyledButton>
  );
}
