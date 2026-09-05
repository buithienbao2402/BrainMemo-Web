import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseChaptersApi } from '../api/course-chapters.api';

export const courseChaptersKeys = {
  list: (courseId: number, isDraft: boolean) => ['courses', courseId, 'chapters', isDraft] as const,
};

export function useCourseChapters(courseId: number, isDraft: boolean) {
  return useQuery({
    queryKey: courseChaptersKeys.list(courseId, isDraft),
    queryFn: () => courseChaptersApi.getCourseChapters(courseId, isDraft),
    enabled: Number.isFinite(courseId),
  });
}

export function useDeleteChapter(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chapterId: number) => courseChaptersApi.deleteChapter(chapterId),
    onSuccess: () => {
      // Key rút gọn -> khớp tiền tố cả 2 query (isDraft=true và isDraft=false), invalidate 1 lần đủ cho cả 2 tab
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'chapters'] });
    },
  });
}