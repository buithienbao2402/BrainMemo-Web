import { useMutation } from '@tanstack/react-query';
import { submitChapterDraftMock } from '../api/chapter-builder.mock.api';
import { submitChapterDraftReal } from '../api/chapter-builder.api';
import type { ChapterDraftSnapshot } from '../store/chapterBuilderStore';

// Công tắc Mock <-> Real. Đổi thành false khi Backend thật đã sẵn sàng.
const USE_MOCK = true;

interface SubmitChapterBuilderParams {
  courseId: number;
  draftState: ChapterDraftSnapshot;
}

export function useSubmitChapterBuilder() {
  return useMutation({
    mutationFn: ({ courseId, draftState }: SubmitChapterBuilderParams) =>
      USE_MOCK
        ? submitChapterDraftMock(draftState)
        : submitChapterDraftReal(courseId, draftState),
  });
}