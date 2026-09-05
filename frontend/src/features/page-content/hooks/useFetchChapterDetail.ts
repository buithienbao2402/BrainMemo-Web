import { useQuery } from '@tanstack/react-query';
import { fetchChapterDetailMock } from '../api/chapter-builder.mock.api';
import { fetchChapterDetailReal } from '../api/chapter-builder.api';
import type { ChapterServerSnapshot } from '../store/chapterBuilderStore';

// Công tắc Mock <-> Real. Đổi thành false khi Backend thật đã sẵn sàng.
// Lưu ý: nên đồng bộ giá trị này với USE_MOCK trong useSubmitChapterBuilder.ts
// (lý tưởng là gom về 1 config chung, nhưng giữ tách riêng cho khớp pattern hiện tại của 2 hook).
const USE_MOCK = false;

/**
 * Lấy chi tiết 1 chương để hydrate vào chapterBuilderStore, phục vụ luồng Sửa chương.
 * Chỉ gọi API khi có chapterId (tức đang ở route .../chapters/:chapterId/edit).
 */
export function useFetchChapterDetail(chapterId: number | null) {
  return useQuery<ChapterServerSnapshot>({
    queryKey: ['chapter-builder', 'detail', chapterId],
    queryFn: () =>
      USE_MOCK
        ? fetchChapterDetailMock(chapterId as number)
        : fetchChapterDetailReal(chapterId as number),
    enabled: chapterId !== null && Number.isFinite(chapterId),
    staleTime: 0,
    retry: false,
    // Tránh tự refetch khi user chuyển tab rồi quay lại, vì sẽ hydrate lại và ghi đè
    // những thay đổi Creator đang soạn dở trong Zustand store.
    refetchOnWindowFocus: false,
  });
}