import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';

export interface TopCourse {
    rank: number;
    courseId: number;
    title: string;
    coverImage: string | null;
    creatorName: string;
    participantsCount: number;
}

export interface TopCreator {
    rank: number;
    userId: number;
    fullName: string;
    avatarUrl: string | null;
    studentsCount: number;
    coursesCount: number;
}

export async function fetchTopCourses(limit = 10): Promise<TopCourse[]> {
    const { data } = await apiClient.get<ApiResponse<TopCourse[]>>('/leaderboard/courses', { params: { limit } });
    return data.data;
}

export async function fetchTopCreators(limit = 10): Promise<TopCreator[]> {
    const { data } = await apiClient.get<ApiResponse<TopCreator[]>>('/leaderboard/creators', { params: { limit } });
    return data.data;
}