import { Avatar, type AvatarProps } from '@mantine/core';

const AVATAR_COLORS = ['orange', 'pink', 'blue', 'teal', 'grape', 'indigo', 'cyan', 'lime'];

function colorForName(name: string): string {
  if (!name) return 'orange';
  const code = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function initialsForName(name: string): string {
  const trimmed = name?.trim();
  if (!trimmed) return '?';
  return trimmed
    .split(/\s+/)
    .slice(-2) // lấy 2 từ cuối — hợp với cấu trúc "Họ + tên đệm + Tên" của tiếng Việt
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
}

interface UserAvatarProps extends Omit<AvatarProps, 'src' | 'children' | 'color'> {
  fullName?: string | null;
  avatarUrl?: string | null;
}

export function UserAvatar({ fullName, avatarUrl, radius = 'xl', ...rest }: UserAvatarProps) {
  const name = fullName ?? '';
  return (
    <Avatar src={avatarUrl || undefined} color={colorForName(name)} radius={radius} {...rest}>
      {initialsForName(name)}
    </Avatar>
  );
}