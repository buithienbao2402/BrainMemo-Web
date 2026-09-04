import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './router';
import { ModalsProvider } from '@mantine/modals';

export function App() {
  return (
    <AppProviders>
      <ModalsProvider>
        <AppRouter />
      </ModalsProvider>
    </AppProviders>
  );
}