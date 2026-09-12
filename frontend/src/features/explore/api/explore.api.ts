import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { CourseListResponse, ExploreFilters } from '../types/explore.types';

export async function fetchExploreCourses(filters: ExploreFilters) {
  const { data } = await apiClient.get<ApiResponse<CourseListResponse>>('/courses', {
    params: {
      scope: 'public',
      search: filters.search || undefined,
      // #Tag-filter: axios tự serialize mảng thành nhiều key "tags=a&tags=b",
      // khớp với [FromQuery] List<string>? tags ở BE — không cần paramsSerializer riêng.
      tags: filters.tags.length > 0 ? filters.tags : undefined,
      sort: filters.sort || undefined,
      status: filters.status || undefined,
      accessType: filters.accessType || undefined,
      page: filters.page,
      pageSize: 12,
    },

    paramsSerializer: {
      indexes: null // Áp dụng cho Axios v1.x trở lên: Biến tags: ['a','b'] thành tags=a&tags=b
    }
  });
  return data.data;
}

export async function fetchTags() {
  const { data } = await apiClient.get<ApiResponse<string[]>>('/tags');
  return data.data;
}