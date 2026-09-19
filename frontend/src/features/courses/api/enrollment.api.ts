import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';

interface EnrollResponseData {
  enrollmentId: number;
}

export async function enrollInCourse(courseId: number, passcode?: string) {
  const { data } = await apiClient.post<ApiResponse<EnrollResponseData>>(
    `/courses/${courseId}/enroll`,
    passcode ? { passcode } : {}
  );
  return data.data;
}