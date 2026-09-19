// frontend/src/features/profile/pages/ProfilePage.tsx
import { Tabs, Stack, Loader, Center } from '@mantine/core';
import { IconUserCircle, IconSettings } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import { useMyProfile } from '../hooks/useProfile';
import { ProfileInfoTab } from '../components/ProfileInfoTab';
import { SettingsTab } from '../components/SettingsTab';

export function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoading } = useMyProfile();

  const activeTab = searchParams.get('tab') === 'settings' ? 'settings' : 'profile';

  const handleTabChange = (value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'profile') {
      next.set('tab', value);
    } else {
      next.delete('tab');
    }
    setSearchParams(next);
  };

  if (isLoading) return <Center h={300}><Loader color="orange" /></Center>;

  return (
    <Stack gap="lg" p="lg" maw={600} mx="auto">
      <Tabs value={activeTab} onChange={handleTabChange} color="orange">
        <Tabs.List mb="md">
          <Tabs.Tab value="profile" leftSection={<IconUserCircle size={16} />}>
            Thông tin cá nhân
          </Tabs.Tab>
          <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
            Cài đặt
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile">
          <ProfileInfoTab />
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <SettingsTab />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}