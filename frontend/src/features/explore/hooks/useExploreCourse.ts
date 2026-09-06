import { useQuery } from '@tanstack/react-query';
import { fetchExploreCourses } from '../api/explore.api';
import type { ExploreFilters } from '../types/explore.types';

export function useExploreCourses(filters: ExploreFilters) {
  return useQuery({
    queryKey: ['explore-courses', filters],
    queryFn: () => fetchExploreCourses(filters),
    placeholderData: (prev) => prev,
  });
}
