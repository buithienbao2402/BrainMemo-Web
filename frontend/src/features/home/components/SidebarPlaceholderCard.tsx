import { Paper, Stack, Text, Center } from '@mantine/core';
import type { ReactNode } from 'react';

export function SidebarPlaceholderCard({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <Paper shadow="sm" radius="md" p="lg">
      <Stack gap="xs">
        <Text fw={700}>{title}</Text>
        <Center h={100}>
          <Stack gap={4} align="center">
            {icon}
            <Text size="xs" c="dimmed">Chưa có dữ liệu</Text>
          </Stack>
        </Center>
      </Stack>
    </Paper>
  );
}