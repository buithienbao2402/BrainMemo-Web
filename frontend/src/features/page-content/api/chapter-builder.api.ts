import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { AccessType } from '@/features/course-management/types/course-management.types';
import type { 
  BlockDraft, 
  ChapterDraftSnapshot, 
  PageDraft, 
  ChapterServerSnapshot, 
  MediaBlockDraft 
} from '../store/chapterBuilderStore';

interface CreateChapterResponseData {
  id: number;
}

interface CreatePageResponseData {
  id: number;
}

interface PresignedUrlResponseData {
  uploadUrl: string;
  objectKey: string;
  expiresAt: string;
}

interface ChapterSummaryResponse {
  id: number;
  title: string;
  accessType: AccessType;
  pages: Array<{ id: number; title: string; orderIndex: number; accessType: AccessType }>;
}

interface PageDetailResponse {
  id: number;
  title: string;
  blocks: Array<
    | { id: number; blockType: 'TEXT'; contentText: string }
    | { id: number; blockType: 'IMAGE' | 'AUDIO' | 'VIDEO'; mediaUrl: string }
  >;
}

async function createChapter(courseId: number, draftState: ChapterDraftSnapshot): Promise<number> {
  const { data } = await apiClient.post<ApiResponse<CreateChapterResponseData>>(
    `/courses/${courseId}/chapters`,
    {
      title: draftState.chapterTitle,
      accessType: draftState.accessType,
      ...(draftState.accessType === 'PROTECTED' ? { passcode: draftState.passcode } : {}),
    }
  );
  return data.data.id;
}

async function createPage(chapterId: number, page: PageDraft): Promise<number> {
  const { data } = await apiClient.post<ApiResponse<CreatePageResponseData>>(
    `/chapters/${chapterId}/pages`,
    { title: page.title }
  );
  return data.data.id;
}

async function uploadMediaAndGetObjectKey(
  file: File,
  mediaType: 'IMAGE' | 'AUDIO' | 'VIDEO'
): Promise<string> {
  const { data } = await apiClient.post<ApiResponse<PresignedUrlResponseData>>(
    '/media/presigned-url',
    { fileName: file.name, contentType: file.type, mediaType }
  );
  const { uploadUrl, objectKey } = data.data;

  // PUT thẳng lên MinIO - KHÔNG qua apiClient (khác origin, không cần Bearer token,
  // không đi qua interceptor refresh-token).
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error(`Upload media thất bại (status ${uploadRes.status})`);
  }

  return objectKey;
}

async function createBlock(pageId: number, block: BlockDraft): Promise<void> {
  if (block.blockType === 'TEXT') {
    await apiClient.post(`/pages/${pageId}/blocks`, {
      blockType: 'TEXT',
      contentText: block.contentText,
    });
    return;
  }

  if (!block.rawFile) {
    throw new Error(`Block ${block.blockType} chưa chọn file, không thể đăng.`);
  }

  const objectKey = await uploadMediaAndGetObjectKey(block.rawFile, block.blockType);

  await apiClient.post(`/pages/${pageId}/blocks`, {
    blockType: block.blockType,
    mediaObjectKey: objectKey,
  });
}

// ---------------------------------------------------------------------------
// Đọc chi tiết chương (luồng Sửa)
// ---------------------------------------------------------------------------
export async function fetchChapterDetailReal(chapterId: number): Promise<ChapterServerSnapshot> {
  const { data: chapterEnvelope } = await apiClient.get<ApiResponse<ChapterSummaryResponse>>(
    `/chapters/${chapterId}`
  );
  const chapter = chapterEnvelope.data;

  const pages: PageDraft[] = await Promise.all(
    chapter.pages.map(async (pageSummary) => {
      const { data: pageEnvelope } = await apiClient.get<ApiResponse<PageDetailResponse>>(
        `/pages/${pageSummary.id}`
      );
      const pageDetail = pageEnvelope.data;

      const blocks: BlockDraft[] = pageDetail.blocks.map((b) => {
        if (b.blockType === 'TEXT') {
          return {
            blockTempId: crypto.randomUUID(),
            blockId: b.id,
            blockType: 'TEXT',
            contentText: b.contentText,
          };
        }
        const mediaBlock: MediaBlockDraft = {
          blockTempId: crypto.randomUUID(),
          blockId: b.id,
          blockType: b.blockType,
          rawFile: null,
          previewUrl: b.mediaUrl,
        };
        return mediaBlock;
      });

      return {
        pageTempId: crypto.randomUUID(),
        pageId: pageDetail.id,
        title: pageDetail.title,
        blocks,
      };
    })
  );

  return {
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    accessType: chapter.accessType,
    pages,
  };
}

// ---------------------------------------------------------------------------
// Submit: Tạo mới chương
// ---------------------------------------------------------------------------
export async function submitChapterDraftReal(
  courseId: number,
  draftState: ChapterDraftSnapshot
): Promise<{ success: true; chapterId: number }> {
  let chapterId: number | null = null;

  try {
    chapterId = await createChapter(courseId, draftState);

    for (const page of draftState.pages) {
      const pageId = await createPage(chapterId, page);
      for (const block of page.blocks) {
        await createBlock(pageId, block);
      }
    }

    return { success: true, chapterId };
  } catch (error) {
    if (chapterId !== null) {
      try {
        await apiClient.delete(`/chapters/${chapterId}`);
      } catch {
        console.error(
          `[chapter-builder] Dọn rác thất bại: chapter #${chapterId} có thể còn sót lại trên server.`
        );
      }
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Submit: Cập nhật chương (luồng Sửa)
// ---------------------------------------------------------------------------
async function buildBlockPayload(block: BlockDraft) {
  if (block.blockType === 'TEXT') {
    return { blockType: 'TEXT' as const, contentText: block.contentText };
  }
  if (!block.rawFile) return null;
  const objectKey = await uploadMediaAndGetObjectKey(block.rawFile, block.blockType);
  return { blockType: block.blockType, mediaObjectKey: objectKey };
}

export async function updateChapterDraftReal(
  chapterId: number,
  draftState: ChapterDraftSnapshot,
  removedPageIds: number[],
  removedBlockIds: number[],
): Promise<void> {
  await apiClient.put(`/chapters/${chapterId}`, {
    title: draftState.chapterTitle,
    accessType: draftState.accessType,
    ...(draftState.passcode.trim() ? { passcode: draftState.passcode } : {}),
  });

  await Promise.all(removedPageIds.map((id) => apiClient.delete(`/pages/${id}`)));
  await Promise.all(removedBlockIds.map((id) => apiClient.delete(`/blocks/${id}`)));

  for (const page of draftState.pages) {
    const pageId = page.pageId ?? (await createPage(chapterId, page));
    if (page.pageId) {
      await apiClient.put(`/pages/${pageId}`, { title: page.title });
    }

    for (const block of page.blocks) {
      const payload = await buildBlockPayload(block);
      if (!payload) continue; 
      
      if (block.blockId) {
        await apiClient.put(`/blocks/${block.blockId}`, payload);
      } else {
        await apiClient.post(`/pages/${pageId}/blocks`, payload);
      }
    }
  }
}