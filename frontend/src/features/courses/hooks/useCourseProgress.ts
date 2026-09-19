import { useQuery } from '@tanstack/react-query';
import { fetchCourseProgress } from '../api/course-progress.api';

export const courseProgressKeys = {
  detail: (courseId: number) => ['course-progress', courseId] as const,
};

export function useCourseProgress(courseId: number) {
  return useQuery({
    queryKey: courseProgressKeys.detail(courseId),
    queryFn: () => fetchCourseProgress(courseId),
    enabled: !!courseId,
  });
}