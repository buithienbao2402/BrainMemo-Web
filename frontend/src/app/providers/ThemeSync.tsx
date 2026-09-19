// frontend/src/app/providers/ThemeSync.tsx
import { useEffect } from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { useMyProfile } from '@/features/profile/hooks/useProfile';

/**
 * Component không render UI — chỉ đồng bộ Mantine colorScheme với themeMode
 * thật sự lưu trong tài khoản (DB) mỗi khi profile được load/refetch.
 * Đây là bước khắc phục việc Mantine mặc định lưu theme vào localStorage
 * của trình duyệt (dùng chung cho mọi tài khoản) thay vì theo user.
 */
export function ThemeSync() {
  const { data: profile } = useMyProfile();
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  useEffect(() => {
    if (!profile?.themeMode) return;
    const target = profile.themeMode === 'DARK' ? 'dark' : 'light';
    if (colorScheme !== target) {
      setColorScheme(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.themeMode]);

  return null;
}