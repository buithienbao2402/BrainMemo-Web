// usePageDetail.ts
import { useQuery } from '@tanstack/react-query';
import { fetchPageDetail } from '../api/reading.api';

export function usePageDetail(pageId: number | undefined, passcode?: string) {
  return useQuery({
    queryKey: ['reading-page', pageId, passcode],
    queryFn: () => fetchPageDetail(pageId as number, passcode),
    enabled: !!pageId,
    retry: false,
  });
}