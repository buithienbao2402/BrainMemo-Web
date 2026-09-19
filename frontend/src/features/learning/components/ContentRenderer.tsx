// File: src/features/learning/components/ContentRenderer.tsx
// Trang KHÔNG có block QUIZ (TEXT/IMAGE/AUDIO/VIDEO/FLASHCARD) -> nút "Đánh dấu hoàn thành" gọi
// POST /pages/{id}/complete. Trang CÓ block QUIZ -> gom đáp án của TẤT CẢ block Quiz trên trang,
// 1 nút "Nộp bài & lưu tiến độ" gọi POST /pages/{id}/quiz/submit đúng 1 lần (khớp thiết kế backend:
// submit theo pageId, không theo blockId — nếu trang có nhiều quiz block thì tính điểm chung).

import { useState } from 'react';
import { Stack, Button, Alert, Group, Text } from '@mantine/core';
import { IconCheck, IconBulb } from '@tabler/icons-react';
import type { Block } from '@/features/learning/types/reading.types';
import { TextBlockView } from './TextBlockView';
import { ImageBlockView } from './ImageBlockView';
import { QuizBlockView } from './QuizBlockView';
import { FlashcardBlockView } from './FlashcardBlockView';
import { useCompletePage, useSubmitQuiz } from '../hooks/useProgress';

interface ContentRendererProps {
  blocks: Block[];
  pageId: number;
  chapterId: number;
}

export function ContentRenderer({ blocks, pageId, chapterId }: ContentRendererProps) {
  const hasQuizBlock = blocks.some((b) => b.blockType === 'QUIZ');

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isPageMarkedComplete, setIsPageMarkedComplete] = useState(false);

  const completePage = useCompletePage(chapterId);
  const submitQuiz = useSubmitQuiz(chapterId);

  const handleAnswerChange = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleCompletePage = () => {
    completePage.mutate(pageId, { onSuccess: () => setIsPageMarkedComplete(true) });
  };

  const handleSubmitQuizProgress = () => {
    const payload = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
      questionId: Number(questionId),
      selectedOptionId,
    }));
    if (payload.length === 0) return;
    submitQuiz.mutate({ pageId, answers: payload });
  };

  return (
    <Stack gap="lg" maw={760} mx="auto">
      {blocks.map((block) => {
        switch (block.blockType) {
          case 'TEXT':
            return <TextBlockView key={block.id} contentText={block.contentText ?? ''} />;
          case 'IMAGE':
            return <ImageBlockView key={block.id} mediaUrl={block.mediaUrl ?? ''} />;
          case 'QUIZ':
            return (
              <QuizBlockView key={block.id} questions={block.quiz?.questions ?? []} onAnswerChange={handleAnswerChange} />
            );
          case 'FLASHCARD':
            return (
              <Stack key={block.id} gap="sm">
                {(block.flashcards ?? []).map((card) => (
                  <FlashcardBlockView key={card.flashcardId} frontText={card.frontText} backText={card.backText} />
                ))}
              </Stack>
            );
          default:
            return null;
        }
      })}

      {!hasQuizBlock && (
        <Group justify="flex-end">
          <Button
            color="green"
            variant={isPageMarkedComplete ? 'light' : 'filled'}
            leftSection={<IconCheck size={16} />}
            loading={completePage.isPending}
            disabled={isPageMarkedComplete}
            onClick={handleCompletePage}
          >
            {isPageMarkedComplete ? 'Đã hoàn thành trang này' : 'Đánh dấu hoàn thành'}
          </Button>
        </Group>
      )}

      {hasQuizBlock && (
        <Stack gap="xs">
          <Group justify="flex-end">
            <Button color="orange" loading={submitQuiz.isPending} onClick={handleSubmitQuizProgress}>
              Nộp bài & lưu tiến độ
            </Button>
          </Group>
          {submitQuiz.data && (
            <Alert color={submitQuiz.data.passed ? 'green' : 'red'} icon={<IconBulb size={16} />} variant="light">
              <Text size="sm">
                Điểm: {submitQuiz.data.scorePercent}% (cần đạt {submitQuiz.data.requiredPercent}%) —{' '}
                {submitQuiz.data.passed ? 'Đạt, trang đã được đánh dấu hoàn thành.' : 'Chưa đạt, có thể làm lại.'}
              </Text>
            </Alert>
          )}
        </Stack>
      )}
    </Stack>
  );
}