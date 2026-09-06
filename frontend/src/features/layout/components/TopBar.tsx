import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Group, TextInput, Button, ActionIcon, Menu, Avatar, Text, Indicator } from '@mantine/core';
import {
  IconSearch, IconBell, IconSun, IconMoon, IconHome,
  IconLayoutDashboard, IconFlame, IconUser, IconSettings, IconLogout,
} from '@tabler/icons-react';
import logo from '@/assets/brainmemo-logo-orange.png';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useUIStore } from '@/stores/uiStore';
import classes from './TopBar.module.css';

export function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();
  const { themeMode, toggleTheme } = useUIStore(); // TODO: đổi tên field/hàm cho khớp uiStore.ts thật
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    const trimmed = searchValue.trim();
    navigate(trimmed ? `/explore?search=${encodeURIComponent(trimmed)}` : '/explore');
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={classes.wrapper}>
      <Group justify="space-between" className={classes.topRow}>
        <Group gap="sm" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src={logo} alt="BrainMemo" height={32} />
          <Text fw={700} size="lg">BrainMemo</Text>
        </Group>

        <TextInput
          placeholder="Tìm khóa học, tác giả"
          leftSection={<IconSearch size={16} />}
          value={searchValue}
          onChange={(e) => setSearchValue(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className={classes.searchInput}
        />

        <Group gap="sm">
          <Button leftSection={<IconLayoutDashboard size={16} />} color="orange" onClick={() => navigate('/creator/dashboard')}>
            TẠO KHÓA HỌC
          </Button>

          <Indicator color="red" size={8} offset={4}>
            <ActionIcon variant="subtle" size="lg" radius="xl">
              <IconBell size={18} />
            </ActionIcon>
          </Indicator>

          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <Group gap={6} style={{ cursor: 'pointer' }}>
                <Avatar src={user?.avatarUrl} color="orange" radius="xl">{user?.fullName?.charAt(0)}</Avatar>
                <Text size="sm" fw={600}>{user?.fullName}</Text>
              </Group>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconUser size={14} />} onClick={() => navigate('/profile')}>
                Thông tin cá nhân
              </Menu.Item>
              <Menu.Item leftSection={<IconSettings size={14} />} onClick={() => navigate('/profile?tab=settings')}>
                Cài đặt
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item leftSection={<IconLogout size={14} />} color="red" onClick={handleLogout}>
                Đăng xuất
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      <Group gap="sm" className={classes.tabRow} justify="space-between">
        <Group gap="sm">
          <Button variant={isActive('/') ? 'filled' : 'default'} color="orange" leftSection={<IconHome size={16} />} onClick={() => navigate('/')}>
            Trang chủ
          </Button>
          <Button variant="default" color="orange" onClick={() => navigate('/creator/dashboard')}>
            Dashboard học tập
          </Button>
          <Button variant={isActive('/explore') ? 'filled' : 'default'} color="orange" leftSection={<IconFlame size={16} />} onClick={() => navigate('/explore')}>
            KHÁM PHÁ
          </Button>
        </Group>

        <ActionIcon variant="default" size="lg" radius="xl" onClick={toggleTheme}>
          {themeMode === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
        </ActionIcon>
      </Group>
    </div>
  );
}