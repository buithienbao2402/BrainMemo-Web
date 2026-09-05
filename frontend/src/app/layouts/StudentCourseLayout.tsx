import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ActionIcon, Avatar, Group, Indicator, TextInput, UnstyledButton, useMantineColorScheme } from '@mantine/core';
import { IconBell, IconSearch, IconSun, IconMoonStars, IconFlame, IconHome } from '@tabler/icons-react';
import logoUrl from '@/assets/brainmemo-logo-dark.png';
import createIcon from '@/assets/brainmemo-create-course-icon.png';
import dashIcon from '@/assets/course-icon-learning-dashboard-final.png';
import logoFooterUrl from '@/assets/brainmemo-logo-orange.png'; // Đã dùng logo cam cho footer
import classes from './StudentCourseLayout.module.css';

interface StudentCourseLayoutProps {
  children: ReactNode;
}

interface NavPillProps {
  to: string;
  label: string;
  icon: ReactNode;
}

function NavPill({ to, label, icon }: NavPillProps) {
  const { pathname } = useLocation();
  // Highlight nếu đúng route
  const isActive = pathname === to || (to !== '/' && pathname.includes(to));

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

export function StudentCourseLayout({ children }: StudentCourseLayoutProps) {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <div className={classes.page}>
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
            styles={{
              input: {
                backgroundColor: '#2a2a2a',
                border: 'none',
                color: '#fff',
              },
            }}
          />

          <Group gap="md" wrap="nowrap">
            <UnstyledButton className={classes.createButton}
            >
              
              <img src={createIcon} alt="Tạo khóa học" className={classes.createIcon} />
              <span className={classes.createLabel}>TẠO KHÓA HỌC</span>
            </UnstyledButton>

            <Indicator color="red" size={9} offset={5} processing>
              <ActionIcon variant="subtle" size="lg" radius="xl">
                <IconBell size={22} color="#fff" stroke={1.5} />
              </ActionIcon>
            </Indicator>

            <Group gap={10} wrap="nowrap">
              <Avatar color="orange" radius="xl" size="md">
                QT
              </Avatar>
              <span className={classes.userName}>Quang Trần</span>
            </Group>
          </Group>
        </div>

        <div className={classes.subtopbar}>
          <div className={classes.subtopbarInner}>
            <Group gap="xs">
              <NavPill
                to="/"
                label="Trang chủ"
                icon={<IconHome size={18} />}
              />
              <NavPill
                to="/learning/dashboard"
                label="Dashboard học tập"
                icon={<img src={dashIcon} alt="" className={classes.navIcon} />}
              />
              <NavPill 
                to="/explore" 
                label="Khám phá" 
                icon={<IconFlame size={18} />} 
              />
              
              {/* Nút Sáng Tối nằm ngay sau Khám Phá */}
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

      <main className={classes.main}>
        <div className={classes.container}>
          {children}
        </div>
      </main>

      <footer className={classes.footer}>
        <div className={classes.footerInner}>
          <div className={classes.footerLeft}>
            <img src={logoFooterUrl} alt="BrainMemo" className={classes.footerLogo} />
            <span>•</span>
            <span>Khám phá tri thức, mở mang tầm mắt</span>
            <span>•</span>
            <span>© {new Date().getFullYear()}</span>
          </div>

          <div className={classes.footerRight}>
            <span className={classes.liveDot} />
            Đang có 1,204 người đọc
          </div>
        </div>
      </footer>
    </div>
  );
}