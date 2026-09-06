import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { ChapterDetail, PageDetail } from '../types/reading.types';

export async function fetchChapterDetail(chapterId: number, passcode?: string) {
  const { data } = await apiClient.get<ApiResponse<ChapterDetail>>(
    `/chapters/${chapterId}`,
    passcode ? { headers: { 'X-Access-Passcode': passcode } } : undefined
  );
  return data.data;
}

export async function fetchPageDetail(pageId: number, passcode?: string) {
  const { data } = await apiClient.get<ApiResponse<PageDetail>>(
    `/pages/${pageId}`,
    passcode ? { headers: { 'X-Access-Passcode': passcode } } : undefined
  );
  return data.data;
}