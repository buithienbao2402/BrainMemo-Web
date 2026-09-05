import type { ReactNode } from 'react';
import { Button, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';

import logoUrl from '@/assets/brainmemo-logo-dark.png';
import dashboardIconUrl from '@/assets/brainmemo-course-management-topbar-icon.png';
import logoFooterUrl from '@/assets/brainmemo-logo-orange.png';
import classes from './CourseDashboardLayout.module.css';

interface CourseDashboardLayoutProps {
  children: ReactNode;
}

export function CourseDashboardLayout({ children }: CourseDashboardLayoutProps) {
  const openCreateCourseModal = useUIStore((s) => s.openCreateCourseModal);

  return (
    <div className={classes.page}>
      <header className={classes.header}>
        <img src={logoUrl} alt="BrainMemo" className={classes.headerLogo} />

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

      <footer className={classes.footer}>
        <div className={classes.footerLeft}>
          <img src={logoFooterUrl} alt="BrainMemo" className={classes.footerLogo} />
          <span>Khám phá tri thức, mở rộng tầm mắt</span>
          <span>·</span>
          <span>© {new Date().getFullYear()}</span>
        </div>

        <div className={classes.footerRight}>
          <span className={classes.liveDot} />
          Đang có 0 người đọc
        </div>
      </footer>
    </div>
  );
}