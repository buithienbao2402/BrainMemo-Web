import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollInCourse } from '../api/enrollment.api';
import { courseProgressKeys } from './useCourseProgress';

export function useEnrollCourse(courseId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (passcode?: string) => enrollInCourse(courseId, passcode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseProgressKeys.detail(courseId) });
    },
  });
}