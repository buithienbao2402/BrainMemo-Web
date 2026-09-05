import type { ChapterDraftSnapshot, ChapterServerSnapshot } from '../store/chapterBuilderStore';

const MOCK_DELAY = 800;

export async function submitChapterDraftMock(
  draftState: ChapterDraftSnapshot
): Promise<{ success: true }> {
  console.log('[MOCK] submitChapterDraft:', draftState);

  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 1000);
  });
}

export function fetchChapterDetailMock(chapterId: number): Promise<ChapterServerSnapshot> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        chapterId,
        chapterTitle: `[MOCK] Chương #${chapterId} - Nhập môn React`,
        accessType: 'PUBLIC',
        pages: [
          {
            pageTempId: crypto.randomUUID(),
            pageId: 1001,
            title: 'Trang 1',
            blocks: [
              {
                blockTempId: crypto.randomUUID(),
                blockId: 5001,
                blockType: 'TEXT',
                contentText: 'Đây là nội dung mock để test luồng Sửa chương.',
              },
            ],
          },
          {
            pageTempId: crypto.randomUUID(),
            pageId: 1002,
            title: 'Trang 2',
            blocks: [],
          },
        ],
      });
    }, MOCK_DELAY);
  });
}

export function updateChapterDraftMock(
  _chapterId: number,
  _draftState: ChapterDraftSnapshot,
): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
}