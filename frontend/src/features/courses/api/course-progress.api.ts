import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';

export interface ChapterProgressState {
  chapterId: number;
  isCompleted: boolean;
}

export interface CourseProgress {
  isEnrolled: boolean;
  progressPercent: number;
  currentChapterId: number | null;
  currentChapterOrderIndex: number | null;
  currentPageId: number | null;
  chapters: ChapterProgressState[];
}

export async function fetchCourseProgress(courseId: number): Promise<CourseProgress> {
  const { data } = await apiClient.get<ApiResponse<CourseProgress>>(`/courses/${courseId}/progress`);
  return data.data;
}