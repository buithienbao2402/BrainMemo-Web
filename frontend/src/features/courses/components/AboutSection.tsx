import { Paper, Stack, Text } from '@mantine/core';

interface AboutSectionProps {
  description: string;
}

export function AboutSection({ description }: AboutSectionProps) {
  const paragraphs = description.split('\n\n');

  return (
    <Paper shadow="sm" radius="md" p="lg">
      <Text fw={700} c="orange" size="sm" mb="sm">
        GIỚI THIỆU
      </Text>

      <Stack gap="sm">
        {paragraphs.map((paragraph, index) => (
          <Text key={index} size="sm" c="dimmed">
            {paragraph}
          </Text>
        ))}
      </Stack>
    </Paper>
  );
}
