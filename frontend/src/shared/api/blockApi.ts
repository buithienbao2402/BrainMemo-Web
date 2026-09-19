import { apiClient } from '@/shared/lib/axios';

export interface CreateBlockRequest {
    blockType: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'QUIZ' | 'FLASHCARD';
    orderIndex: number;
    contentText?: string | null;
    mediaUrl?: string | null;
}

export const createBlockApi = async (pageId: number, data: CreateBlockRequest) => {
    const response = await apiClient.post(`/pages/${pageId}/blocks`, data);
    return response.data;
};