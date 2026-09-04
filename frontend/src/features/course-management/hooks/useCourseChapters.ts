import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseChaptersMockApi } from '../api/course-chapters.mock.api';
import { courseChaptersApi } from '../api/course-chapters.api';

// ==========================================
// CÔNG TẮC API: True = Dùng Mock, False = Gọi API thật
const USE_MOCK = true;
// ==========================================

export const courseChaptersKeys = {
  list: (courseId: number) => ['courses', courseId, 'chapters'] as const,
};

export function useCourseChapters(courseId: number) {
  return useQuery({
    queryKey: courseChaptersKeys.list(courseId),
    queryFn: () => 
      USE_MOCK 
        ? courseChaptersMockApi.getCourseChapters(courseId) 
        : courseChaptersApi.getCourseChapters(courseId),
    enabled: Number.isFinite(courseId),
  });
}

export function useDeleteChapter(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chapterId: number) => 
      USE_MOCK 
        ? courseChaptersMockApi.deleteChapter(chapterId)
        : courseChaptersApi.deleteChapter(chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseChaptersKeys.list(courseId) });
    },
  });
}