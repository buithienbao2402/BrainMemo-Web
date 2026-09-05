import type { ChapterDraftSnapshot } from '../store/chapterBuilderStore';

export async function submitChapterDraftMock(
  draftState: ChapterDraftSnapshot
): Promise<{ success: true }> {
  console.log('[MOCK] submitChapterDraft:', draftState);

  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 1000);
  });
}