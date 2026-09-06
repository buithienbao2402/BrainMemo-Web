import type { ReactNode } from 'react';
import { TopBar } from '@/features/layout/components/TopBar';
import { Footer } from '@/features/layout/components/Footer';
import classes from './StudentCourseLayout.module.css';

interface StudentCourseLayoutProps {
  children: ReactNode;
}

export function StudentCourseLayout({ children }: StudentCourseLayoutProps) {
  return (
    <div className={classes.page}>
      <TopBar />

      <main className={classes.main}>
        <div className={classes.container}>
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}