import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import { Footer } from '@/features/layout/components/Footer';

import logoUrl from '@/assets/brainmemo-logo-dark.png';
import dashboardIconUrl from '@/assets/brainmemo-course-management-topbar-icon.png';
import classes from './CourseDashboardLayout.module.css';

interface CourseDashboardLayoutProps {
  children: ReactNode;
}

export function CourseDashboardLayout({ children }: CourseDashboardLayoutProps) {
  const openCreateCourseModal = useUIStore((s) => s.openCreateCourseModal);
  const navigate = useNavigate();

  return (
    <div className={classes.page}>
      <header className={classes.header}>
        <Group style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src={logoUrl} alt="BrainMemo" className={classes.headerLogo} />
        </Group>

        <Group gap="sm">
          <Button
            component={Link}
            to="/creator/dashboard"
            leftSection={<img src={dashboardIconUrl} alt="" className={classes.buttonIcon} />}
          >
            Dashboard
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateCourseModal}>
            Tạo khóa học mới
          </Button>
        </Group>
      </header>

      <main className={classes.main}>{children}</main>

      <Footer />
    </div>
  );
}