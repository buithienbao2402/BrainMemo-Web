import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';

export interface LeaderboardUser {
    rank: number;
    userId: number;
    fullName: string;
    avatarUrl: string | null;
    totalScore: number;
    completedLessonsCount: number;
    passedQuizzesCount: number;
    completedCoursesCount: number;
}

export async function fetchLeaderboard(limit = 10): Promise<LeaderboardUser[]> {
    const { data } = await apiClient.get<ApiResponse<LeaderboardUser[]>>('/leaderboard', {
        params: { limit },
    });
    return data.data;
}