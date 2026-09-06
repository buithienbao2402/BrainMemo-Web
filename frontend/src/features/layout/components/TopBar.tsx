import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ActionIcon, Group, Indicator, Menu, TextInput, UnstyledButton, useMantineColorScheme,
} from '@mantine/core';
import {
  IconBell, IconSearch, IconSun, IconMoonStars, IconFlame, IconHome,
  IconUser, IconSettings, IconLogout,
} from '@tabler/icons-react';
import logoUrl from '@/assets/brainmemo-logo-dark.png';
import createIcon from '@/assets/brainmemo-create-course-icon.png';
import dashIcon from '@/assets/course-icon-learning-dashboard-final.png';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useUnreadNotificationsCount } from '@/features/notifications/hooks/useUnreadNotificationsCount';
import { UserAvatar } from '@/shared/components/UserAvatar';
import classes from './TopBar.module.css';

interface NavPillProps {
  to: string;
  label: string;
  icon: ReactNode;
}

function NavPill({ to, label, icon }: NavPillProps) {
  const { pathname } = useLocation();
  const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));

  return (
    <UnstyledButton
      component={Link}
      to={to}
      className={`${classes.navItem} ${isActive ? classes.navItemActive : ''}`}
    >
      {icon}
      <span className={classes.navLabel}>{label}</span>
    </UnstyledButton>
  );
}

export function TopBar() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    const trimmed = searchValue.trim();
    navigate(trimmed ? `/explore?search=${encodeURIComponent(trimmed)}` : '/explore');
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className={classes.headerGroup}>
      <div className={classes.topbar}>
        <Link to="/">
          <img src={logoUrl} alt="BrainMemo" className={classes.logo} />
        </Link>

        <TextInput
          placeholder="Tìm khóa học, tác giả"
          leftSection={<IconSearch size={16} color="#888" />}
          radius="xl"
          className={classes.search}
          value={searchValue}
          onChange={(e) => setSearchValue(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          styles={{
            input: {
              backgroundColor: '#2a2a2a',
              border: 'none',
              color: '#fff',
            },
          }}
        />

        <Group gap="md" wrap="nowrap">
          <UnstyledButton className={classes.createButton} onClick={() => navigate('/creator/dashboard')}>
            <img src={createIcon} alt="Tạo khóa học" className={classes.createIcon} />
            <span className={classes.createLabel}>TẠO KHÓA HỌC</span>
          </UnstyledButton>

          <Indicator color="red" size={9} offset={5} disabled={unreadCount === 0}>
            <ActionIcon variant="subtle" size="lg" radius="xl">
              <IconBell size={22} color="#fff" stroke={1.5} />
            </ActionIcon>
          </Indicator>

          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <Group gap={10} wrap="nowrap" style={{ cursor: 'pointer' }}>
                <UserAvatar fullName={user?.fullName} avatarUrl={user?.avatarUrl} size="md" />
                <span className={classes.userName}>{user?.fullName}</span>
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
      </div>

      <div className={classes.subtopbar}>
        <div className={classes.subtopbarInner}>
          <Group gap="xs">
            <NavPill to="/" label="Trang chủ" icon={<IconHome size={18} />} />
            <NavPill
              to="/creator/dashboard"
              label="Dashboard học tập"
              icon={<img src={dashIcon} alt="" className={classes.navIcon} />}
            />
            <NavPill to="/explore" label="Khám phá" icon={<IconFlame size={18} />} />

            <ActionIcon
              variant="subtle"
              radius="xl"
              size="lg"
              className={classes.themeToggle}
              onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
              aria-label="Toggle color scheme"
            >
              {isDark ? <IconSun size={20} /> : <IconMoonStars size={20} />}
            </ActionIcon>
          </Group>
        </div>
      </div>
    </div>
  );
}