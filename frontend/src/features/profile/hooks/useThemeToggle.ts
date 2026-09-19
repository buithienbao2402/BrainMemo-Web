// frontend/src/features/profile/hooks/useThemeToggle.ts
import { useMantineColorScheme } from '@mantine/core';
import { useMyProfile, useUpdateProfile } from './useProfile';

/**
 * Hook dùng chung cho cả nút đổi theme ở TopBar và mục "Giao diện tối" ở Cài đặt.
 * - Đổi ngay UI (Mantine colorScheme) để phản hồi tức thì.
 * - Đồng thời lưu themeMode vào tài khoản qua PUT /api/users/me (full-replace,
 *   nên phải gửi kèm các field khác giữ nguyên từ profile hiện tại).
 */
export function useThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { data: profile } = useMyProfile();
  const updateProfile = useUpdateProfile();

  const isDark = colorScheme === 'dark';

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    setColorScheme(nextIsDark ? 'dark' : 'light');

    if (!profile) return; // Chưa có dữ liệu profile (vd. chưa load xong) -> chỉ đổi UI tạm thời

    updateProfile.mutate({
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      notificationEnabled: profile.notificationEnabled,
      themeMode: nextIsDark ? 'DARK' : 'LIGHT',
    });
  };

  return { isDark, toggleTheme, isPending: updateProfile.isPending };
}