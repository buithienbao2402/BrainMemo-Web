// File: src/features/learning/components/ContentRenderer.tsx
// Bổ sung case QUIZ và FLASHCARD. FLASHCARD block chứa mảng cards -> map ra nhiều FlashcardBlockView.

import { Stack } from '@mantine/core';
import type { Block } from '@/features/learning/mock/mockReadingData';
import { TextBlockView } from './TextBlockView';
import { ImageBlockView } from './ImageBlockView';
import { QuizBlockView } from './QuizBlockView';
import { FlashcardBlockView } from './FlashcardBlockView';

interface ContentRendererProps {
  blocks: Block[];
}

export function ContentRenderer({ blocks }: ContentRendererProps) {
  return (
    <Stack gap="lg" maw={760} mx="auto">
      {blocks.map((block) => {
        switch (block.blockType) {
          case 'TEXT':
            return <TextBlockView key={block.id} contentText={block.contentText} />;
          case 'IMAGE':
            return <ImageBlockView key={block.id} mediaUrl={block.mediaUrl} />;
          case 'QUIZ':
            return <QuizBlockView key={block.id} questions={block.questions} />;
          case 'FLASHCARD':
            // 1 FLASHCARD block có thể chứa nhiều thẻ -> render từng thẻ riêng, key theo card.id
            return (
              <Stack key={block.id} gap="sm">
                {block.cards.map((card) => (
                  <FlashcardBlockView key={card.id} frontText={card.frontText} backText={card.backText} />
                ))}
              </Stack>
            );
          // AUDIO/VIDEO: chưa implement UI ở giai đoạn này
          default:
            return null;
        }
      })}
    </Stack>
  );
}