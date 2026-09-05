// File: src/features/learning/components/FlashcardBlockView.tsx
// 1 component = 1 thẻ flip (front/back). ContentRenderer sẽ map qua block.cards để render danh sách.
// Hiệu ứng lật dùng CSS 3D transform (transform-style: preserve-3d) — không cần thư viện animation ngoài.

import { useState } from 'react';
import { Box, Text, Center } from '@mantine/core';
import { IconRotate } from '@tabler/icons-react';
import classes from './FlashcardBlockView.module.css';

interface FlashcardBlockViewProps {
  frontText: string;
  backText: string;
}

export function FlashcardBlockView({ frontText, backText }: FlashcardBlockViewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <Box
      className={classes.scene}
      onClick={() => setIsFlipped((v) => !v)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setIsFlipped((v) => !v)}
      aria-label="Chạm để lật thẻ"
    >
      {/* .card mang class flipped để CSS xoay cả khối 180deg quanh trục Y */}
      <Box className={`${classes.card} ${isFlipped ? classes.flipped : ''}`}>
        <Center className={`${classes.face} ${classes.front}`}>
          <Text ta="center" fw={500} c="gray.1">
            {frontText}
          </Text>
        </Center>
        <Center className={`${classes.face} ${classes.back}`}>
          <Text ta="center" c="gray.2">
            {backText}
          </Text>
        </Center>
      </Box>

      <Center mt="xs">
        <IconRotate size={14} color="var(--mantine-color-dimmed)" />
        <Text size="xs" c="dimmed" ml={4}>
          Chạm vào thẻ để lật
        </Text>
      </Center>
    </Box>
  );
}