import type { ReactNode } from 'react';
import { TopBar } from '@/features/layout/components/TopBar';

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <TopBar />
      <div>{children}</div>
    </div>
  );
}