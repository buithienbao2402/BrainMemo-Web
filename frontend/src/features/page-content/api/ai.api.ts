import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';

export type AiDifficulty = 'easy' | 'medium' | 'hard';

export interface AiGeneratePayload {
    contentText: string;
    count: number;
    difficulty?: AiDifficulty;
}

export interface AiFlashcardItem {
    frontText: string;
    backText: string;
}

export interface AiQuizOption {
    optionText: string;
    isCorrect: boolean;
}

export interface AiQuizQuestion {
    questionText: string;
    explanation: string | null;
    options: AiQuizOption[];
}

const AI_TIMEOUT_MS = 90_000;

export async function generateFlashcards(payload: AiGeneratePayload): Promise<AiFlashcardItem[]> {
    // Chỉ dùng /ai/..., apiClient sẽ tự thêm tiền tố /api
    const { data } = await apiClient.post<ApiResponse<AiFlashcardItem[]>>('/ai/generate-flashcards', payload, {
        timeout: AI_TIMEOUT_MS,
    });
    return data.data;
}

export async function generateQuiz(payload: AiGeneratePayload): Promise<AiQuizQuestion[]> {
    // Chỉ dùng /ai/..., apiClient sẽ tự thêm tiền tố /api
    const { data } = await apiClient.post<ApiResponse<AiQuizQuestion[]>>('/ai/generate-quiz', payload, {
        timeout: AI_TIMEOUT_MS,
    });
    return data.data;
}