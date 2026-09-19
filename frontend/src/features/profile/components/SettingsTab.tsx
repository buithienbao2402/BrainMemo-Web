// frontend/src/features/profile/components/SettingsTab.tsx
import { Paper, Stack, Group, Text, Switch, Loader, Center } from '@mantine/core';
import { useMyProfile, useUpdateProfile } from '../hooks/useProfile';
import { useThemeToggle } from '../hooks/useThemeToggle';

export function SettingsTab() {
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const { isDark, toggleTheme, isPending: isTogglingTheme } = useThemeToggle();

  if (isLoading || !profile) {
    return <Center h={200}><Loader color="orange" /></Center>;
  }

  const handleToggleNotification = (checked: boolean) => {
    updateProfile.mutate({
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      notificationEnabled: checked,
      themeMode: profile.themeMode,
    });
  };

  return (
    <Stack gap="lg">
      <Paper shadow="sm" radius="md" p="lg">
        <Group justify="space-between" wrap="nowrap">
          <div>
            <Text fw={600}>Thông báo</Text>
            <Text size="sm" c="dimmed">
              Nhận thông báo về chương mới, bình luận, lời mời tham gia khóa học...
            </Text>
          </div>
          <Switch
            checked={profile.notificationEnabled}
            onChange={(e) => handleToggleNotification(e.currentTarget.checked)}
            color="orange"
            size="md"
            disabled={updateProfile.isPending}
          />
        </Group>
      </Paper>

      <Paper shadow="sm" radius="md" p="lg">
        <Group justify="space-between" wrap="nowrap">
          <div>
            <Text fw={600}>Giao diện tối (Dark Mode)</Text>
            <Text size="sm" c="dimmed">
              Áp dụng cho toàn bộ ứng dụng — đồng bộ với nút đổi giao diện trên thanh điều hướng.
            </Text>
          </div>
          <Switch
            checked={isDark}
            onChange={toggleTheme}
            color="orange"
            size="md"
            disabled={isTogglingTheme}
          />
        </Group>
      </Paper>
    </Stack>
  );
}