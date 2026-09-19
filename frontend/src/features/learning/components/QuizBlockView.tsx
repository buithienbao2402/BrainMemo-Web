// File: src/features/learning/components/QuizBlockView.tsx
// Giữ nguyên UX chấm điểm tại chỗ (client-side, dùng option.isCorrect có sẵn trong data trang) để
// không phá trải nghiệm hiện tại — nút "Xem đáp án" (đổi tên từ "Nộp bài" cũ để tránh nhầm với nút
// nộp-lưu-tiến-độ mới ở ContentRenderer). THÊM: mỗi khi chọn đáp án, báo lên component cha qua
// onAnswerChange để cha gom lại toàn trang và gọi API thật lưu tiến độ (2 luồng độc lập nhau).

import { useState } from 'react';
import { Box, Text, Radio, Button, Stack, Group, ThemeIcon, Alert } from '@mantine/core';
import { IconCheck, IconX, IconBulb } from '@tabler/icons-react';
import type { QuizQuestion } from '@/features/learning/types/reading.types';
import classes from './QuizBlockView.module.css';

interface QuizBlockViewProps {
  questions: QuizQuestion[];
  onAnswerChange?: (questionId: number, optionId: number) => void;
}

function QuizQuestionItem({
  question,
  onAnswerChange,
}: {
  question: QuizQuestion;
  onAnswerChange?: (questionId: number, optionId: number) => void;
}) {
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selectedOption = question.options.find((o) => o.optionId === selectedOptionId);
  const isCorrect = submitted && selectedOption?.isCorrect === true;

  const handleSelect = (value: string) => {
    const optionId = Number(value);
    setSelectedOptionId(optionId);
    onAnswerChange?.(question.questionId, optionId);
  };

  const getOptionClass = (optionId: number, optionIsCorrect?: boolean) => {
    if (!submitted) return classes.option;
    if (optionIsCorrect) return `${classes.option} ${classes.optionCorrect}`;
    if (optionId === selectedOptionId) return `${classes.option} ${classes.optionWrong}`;
    return classes.option;
  };

  return (
    <Box className={classes.questionBox} mb="lg">
      <Text fw={600} c="gray.1" mb="sm">
        {question.questionText}
      </Text>

      <Radio.Group value={selectedOptionId?.toString() ?? ''} onChange={handleSelect}>
        <Stack gap="xs">
          {question.options.map((option) => (
            <label key={option.optionId} className={getOptionClass(option.optionId, option.isCorrect)}>
              <Group justify="space-between" wrap="nowrap">
                <Radio value={option.optionId.toString()} label={option.optionText} disabled={submitted} color="orange" />
                {submitted && option.isCorrect && (
                  <ThemeIcon color="green" variant="light" size="sm" radius="xl">
                    <IconCheck size={14} />
                  </ThemeIcon>
                )}
                {submitted && !option.isCorrect && option.optionId === selectedOptionId && (
                  <ThemeIcon color="red" variant="light" size="sm" radius="xl">
                    <IconX size={14} />
                  </ThemeIcon>
                )}
              </Group>
            </label>
          ))}
        </Stack>
      </Radio.Group>

      {!submitted ? (
        <Button mt="md" color="orange" size="xs" disabled={selectedOptionId === null} onClick={() => setSubmitted(true)}>
          Xem đáp án
        </Button>
      ) : (
        <Alert mt="md" color={isCorrect ? 'green' : 'red'} icon={<IconBulb size={16} />} variant="light">
          {isCorrect
            ? (question.explanation ?? 'Chính xác!')
            : 'Chưa chính xác, đáp án đúng là: ' + (question.options.find((o) => o.isCorrect)?.optionText ?? 'N/A')}
        </Alert>
      )}
    </Box>
  );
}

export function QuizBlockView({ questions, onAnswerChange }: QuizBlockViewProps) {
  return (
    <Box className={classes.wrapper}>
      {questions.map((q) => (
        <QuizQuestionItem key={q.questionId} question={q} onAnswerChange={onAnswerChange} />
      ))}
    </Box>
  );
}