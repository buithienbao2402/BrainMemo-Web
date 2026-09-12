import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './router';
import { ModalsProvider } from '@mantine/modals';
import { useActivityHeartbeat } from '@/shared/hooks/useActivityHeartbeat';

export function App() {
  useActivityHeartbeat();

  return (
    <AppProviders>
      <ModalsProvider>
        <AppRouter />
      </ModalsProvider>
    </AppProviders>
  );
}