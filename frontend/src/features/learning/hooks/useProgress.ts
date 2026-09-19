import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchChapterProgress, completePage, submitQuiz } from '../api/progress.api';

export function useChapterProgress(chapterId: number | undefined) {
  return useQuery({
    queryKey: ['chapter-progress', chapterId],
    queryFn: () => fetchChapterProgress(chapterId as number),
    enabled: !!chapterId,
  });
}

export function useCompletePage(chapterId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: number) => completePage(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter-progress', chapterId] });
    },
  });
}

export function useSubmitQuiz(chapterId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pageId, answers }: { pageId: number; answers: { questionId: number; selectedOptionId: number }[] }) =>
      submitQuiz(pageId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter-progress', chapterId] });
    },
  });
}