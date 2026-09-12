import axiosClient from './axiosClient';

export interface CreateBlockRequest {
    blockType: string;    // 'TEXT' | 'MEDIA' | 'QUIZ' | 'FLASHCARD'
    orderIndex: number;
    contentText?: string | null;
}

export const createBlockApi = async (pageId: number, data: CreateBlockRequest) => {
    const response = await axiosClient.post(`/api/pages/${pageId}/blocks`, data);
    return response.data;
};