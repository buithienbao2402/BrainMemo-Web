import { useQuery } from '@tanstack/react-query';
import { fetchTags } from '../api/explore.api';

export function useTags() {
  return useQuery({ queryKey: ['tags'], queryFn: fetchTags, staleTime: 5 * 60_000 });
}