import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { CourseListResponse, ExploreFilters } from '../types/explore.types';

export async function fetchExploreCourses(filters: ExploreFilters) {
  const { data } = await apiClient.get<ApiResponse<CourseListResponse>>('/courses', {
    params: {
      scope: 'public',
      search: filters.search || undefined,
      tag: filters.tag || undefined,
      sort: filters.sort || undefined,
      status: filters.status || undefined,
      accessType: filters.accessType || undefined,
      page: filters.page,
      pageSize: 12,
    },
  });
  return data.data;
}

export async function fetchTags() {
  const { data } = await apiClient.get<ApiResponse<string[]>>('/tags');
  return data.data;
}