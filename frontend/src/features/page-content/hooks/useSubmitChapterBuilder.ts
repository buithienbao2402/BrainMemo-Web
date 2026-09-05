import { useMutation } from '@tanstack/react-query';
import { submitChapterDraftMock, updateChapterDraftMock } from '../api/chapter-builder.mock.api';
import { submitChapterDraftReal, updateChapterDraftReal } from '../api/chapter-builder.api';
import type { ChapterDraftSnapshot } from '../store/chapterBuilderStore';

const USE_MOCK = true;

interface SubmitChapterBuilderParams {
  mode: 'create' | 'edit';
  courseId: number;
  chapterId: number | null;
  draftState: ChapterDraftSnapshot;
  removedPageIds: number[];
  removedBlockIds: number[];
}

export function useSubmitChapterBuilder() {
  return useMutation({
    // Đổi thành async function để dễ xử lý await
    mutationFn: async ({
      mode,
      courseId,
      chapterId,
      draftState,
      removedPageIds,
      removedBlockIds,
    }: SubmitChapterBuilderParams) => {
      
      if (mode === 'edit') {
        if (chapterId == null) {
          throw new Error('Thiếu chapterId khi Sửa chương.');
        }
        // Luồng Update: Chờ API gọi xong (trả về void)
        if (USE_MOCK) {
          await updateChapterDraftMock(chapterId, draftState);
        } else {
          await updateChapterDraftReal(chapterId, draftState, removedPageIds, removedBlockIds);
        }
        // Chủ động trả về Object cho khớp với luồng Create bên dưới
        return { success: true as const, chapterId };
      }

      // Luồng Create (vốn đã trả về object { success, chapterId })
      return USE_MOCK
        ? submitChapterDraftMock(draftState)
        : submitChapterDraftReal(courseId, draftState);
    },
  });
}