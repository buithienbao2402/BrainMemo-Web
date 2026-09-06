import type { ReactNode } from 'react';
import { TopBar } from '@/features/layout/components/TopBar';
import { Footer } from '@/features/layout/components/Footer';

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar />
      <div style={{ flex: 1 }}>{children}</div>
      <Footer />
    </div>
  );
}