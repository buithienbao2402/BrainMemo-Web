import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// Import mock api (GỐC)
import { courseManagementMockApi } from '../api/course-management.mock.api';
// Import api thật (MỚI THÊM)
import { courseManagementApi } from '../api/course-management.api'; 
import type { CreateCoursePayload } from '../types/course-management.types';

// ==========================================
// CÔNG TẮC API: True = Chạy code gốc của ông, False = Gọi Backend
const USE_MOCK = true;
// ==========================================

export const courseManagementKeys = {
  myCourses: ['courses', 'owned'] as const,
};

export function useMyCourses(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [...courseManagementKeys.myCourses, page, pageSize], // Giữ nguyên gốc
    queryFn: () => 
      USE_MOCK 
        ? courseManagementMockApi.getMyCourses(page, pageSize) // Đúng y như gốc
        : courseManagementApi.getMyCourses(page, pageSize),    // Đường phụ cho BE
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => 
      USE_MOCK 
        ? courseManagementMockApi.createCourse(payload) // Đúng y như gốc
        : courseManagementApi.createCourse(payload),    // Đường phụ cho BE
    onSuccess: () => {
      // Giữ nguyên logic gốc của ông
      queryClient.invalidateQueries({ queryKey: courseManagementKeys.myCourses }); 
    },
  });
}