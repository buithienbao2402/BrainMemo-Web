import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseManagementMockApi } from '../api/course-management.mock.api';
import type { CreateCoursePayload } from '../types/course-management.types';

export const courseManagementKeys = {
  myCourses: ['courses', 'owned'] as const,
};

export function useMyCourses(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [...courseManagementKeys.myCourses, page, pageSize],
    queryFn: () => courseManagementMockApi.getMyCourses(page, pageSize),
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => courseManagementMockApi.createCourse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseManagementKeys.myCourses });
    },
  });
}