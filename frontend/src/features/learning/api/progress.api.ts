import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';

export interface ChapterProgress {
  chapterId: number;
  totalPages: number;
  completedPages: number;
  progressPercent: number;
}

export interface QuizSubmitResult {
  scorePercent: number;
  passed: boolean;
  requiredPercent: number;
  progressPercent: number;
}

export async function fetchChapterProgress(chapterId: number): Promise<ChapterProgress> {
  const { data } = await apiClient.get<ApiResponse<ChapterProgress>>(`/chapters/${chapterId}/progress`);
  return data.data;
}

export async function completePage(pageId: number) {
  const { data } = await apiClient.post<ApiResponse<{ pageId: number; isCompleted: boolean; progressPercent: number }>>(
    `/pages/${pageId}/complete`
  );
  return data.data;
}

export async function submitQuiz(pageId: number, answers: { questionId: number; selectedOptionId: number }[]) {
  const { data } = await apiClient.post<ApiResponse<QuizSubmitResult>>(`/pages/${pageId}/quiz/submit`, { answers });
  return data.data;
}