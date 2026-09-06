import { useQuery } from '@tanstack/react-query';
import { fetchChapterDetailReal } from '../api/chapter-builder.api';
import type { ChapterServerSnapshot } from '../store/chapterBuilderStore';

/**
 * Lấy chi tiết 1 chương để hydrate vào chapterBuilderStore, phục vụ luồng Sửa chương.
 * Chỉ gọi API khi có chapterId (tức đang ở route .../chapters/:chapterId/edit).
 */
export function useFetchChapterDetail(chapterId: number | null) {
  return useQuery<ChapterServerSnapshot>({
    queryKey: ['chapter-builder', 'detail', chapterId],
    queryFn: () => fetchChapterDetailReal(chapterId as number),
    enabled: chapterId !== null && Number.isFinite(chapterId),
    staleTime: 0,
    retry: false,
    // Tránh tự refetch khi user chuyển tab rồi quay lại, vì sẽ hydrate lại và ghi đè
    // những thay đổi Creator đang soạn dở trong Zustand store.
    refetchOnWindowFocus: false,
  });
}