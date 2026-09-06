// api/home.api.ts
import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { CourseListResponse } from '@/features/explore/types/explore.types';

async function fetchCourseList(params: Record<string, string | number>) {
  const { data } = await apiClient.get<ApiResponse<CourseListResponse>>('/courses', { params });
  return data.data;
}

export const fetchNewestCourses = () => fetchCourseList({ scope: 'public', sort: 'newest', pageSize: 6 });
export const fetchCompletedCourses = () => fetchCourseList({ scope: 'public', status: 'COMPLETED', pageSize: 6 });
export const fetchRecentlyUpdatedCourses = () => fetchCourseList({ scope: 'public', sort: 'updated', pageSize: 5 });