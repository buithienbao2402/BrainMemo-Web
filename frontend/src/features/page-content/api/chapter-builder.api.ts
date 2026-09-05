import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { BlockDraft, ChapterDraftSnapshot, PageDraft } from '../store/chapterBuilderStore';

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
    // Dọn rác: chapter đã tạo nhưng chuỗi page/block bị đứt giữa chừng (mất mạng, lỗi 500...).
    // Xóa chapter -> cascade xóa luôn page/block đã tạo dở dang (theo ON DELETE CASCADE trong DB).
    if (chapterId !== null) {
      try {
        await apiClient.delete(`/chapters/${chapterId}`);
      } catch {
        // Không để lỗi dọn rác che mất lỗi gốc - chỉ log để dev biết còn rác cần xử lý tay.
        console.error(
          `[chapter-builder] Dọn rác thất bại: chapter #${chapterId} có thể còn sót lại trên server.`
        );
      }
    }
    throw error;
  }
}