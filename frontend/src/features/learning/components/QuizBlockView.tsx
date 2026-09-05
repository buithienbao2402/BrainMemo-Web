// File: src/features/learning/components/QuizBlockView.tsx
// Nhận toàn bộ questions của 1 QuizBlock (1 block có thể chứa nhiều câu hỏi — đúng contract mục 9).
// Mỗi câu hỏi tự quản lý state riêng (selected/submitted) vì học viên có thể nộp từng câu độc lập.
// LƯU Ý: Việc so isCorrect ở đây là check CLIENT-SIDE trên mock data để demo UI.
// Ở bản thật, phải gọi POST /api/pages/{id}/quiz/submit (mục 10) — BE chấm điểm, KHÔNG lộ isCorrect
// trước khi nộp. Giai đoạn 4 sẽ thay state cục bộ này bằng gọi API thật.

import { useState } from 'react';
import { Box, Text, Radio, Button, Stack, Group, ThemeIcon, Alert } from '@mantine/core';
import { IconCheck, IconX, IconBulb } from '@tabler/icons-react';
import type { QuizQuestion } from '@/features/learning/mock/mockReadingData';
import classes from './QuizBlockView.module.css';

interface QuizBlockViewProps {
  questions: QuizQuestion[];
}

// Tách riêng từng câu hỏi thành sub-component để state không bị lẫn giữa các câu.
function QuizQuestionItem({ question }: { question: QuizQuestion }) {
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selectedOption = question.options.find((o) => o.id === selectedOptionId);
  const isCorrect = submitted && selectedOption?.isCorrect === true;

  // Class trạng thái cho từng option: chỉ tô màu SAU khi đã submit
  const getOptionClass = (optionId: number, optionIsCorrect?: boolean) => {
    if (!submitted) return classes.option;
    if (optionIsCorrect) return `${classes.option} ${classes.optionCorrect}`; // Luôn tô xanh đáp án đúng
    if (optionId === selectedOptionId) return `${classes.option} ${classes.optionWrong}`; // Tô đỏ nếu chọn sai
    return classes.option;
  };

  return (
    <Box className={classes.questionBox} mb="lg">
      <Text fw={600} c="gray.1" mb="sm">
        {question.questionText}
      </Text>

      <Radio.Group value={selectedOptionId?.toString() ?? ''} onChange={(v) => setSelectedOptionId(Number(v))}>
        <Stack gap="xs">
          {question.options.map((option) => (
            <label key={option.id} className={getOptionClass(option.id, option.isCorrect)}>
              <Group justify="space-between" wrap="nowrap">
                <Radio value={option.id.toString()} label={option.optionText} disabled={submitted} color="orange" />
                {/* Icon kết quả chỉ hiện sau khi nộp */}
                {submitted && option.isCorrect && (
                  <ThemeIcon color="green" variant="light" size="sm" radius="xl">
                    <IconCheck size={14} />
                  </ThemeIcon>
                )}
                {submitted && !option.isCorrect && option.id === selectedOptionId && (
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
          Nộp bài
        </Button>
      ) : (
        <Alert
          mt="md"
          color={isCorrect ? 'green' : 'red'}
          icon={<IconBulb size={16} />}
          variant="light"
        >
          {isCorrect 
            ? (question.explanation ?? 'Chính xác!') 
            : 'Chưa chính xác, đáp án đúng là: ' + (question.options.find(o => o.isCorrect)?.optionText ?? 'N/A')}
        </Alert>
      )}
    </Box>
  );
}

export function QuizBlockView({ questions }: QuizBlockViewProps) {
  return (
    <Box className={classes.wrapper}>
      {questions.map((q) => (
        <QuizQuestionItem key={q.id} question={q} />
      ))}
    </Box>
  );
}