// useChapterDetail.ts
import { useQuery } from '@tanstack/react-query';
import { fetchChapterDetail } from '../api/reading.api';

export function useChapterDetail(chapterId: number, passcode?: string) {
  return useQuery({
    queryKey: ['reading-chapter', chapterId, passcode],
    queryFn: () => fetchChapterDetail(chapterId, passcode),
    enabled: !!chapterId,
    retry: false,
  });
}